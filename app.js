const express = require("express");
const morgan= require("morgan");
const tourRouter=require("./router/tourRouter");
const userRouter=require("./router/userRouter");
const AppError = require("./utils/appError");
const errorController=require("./controller/errorController");
const rateLimit=require("express-rate-limit");
const helmet=require("helmet");
const mongoSanitize=require("express-mongo-sanitize");
const xss=require("xss-clean");
const hpp=require("hpp");       //HTTP parameter pollution
const reviewRouter=require("./router/reviewRouter");
const viewRouter=require("./router/viewRouter");
const cookieParser=require("cookie-parser");
const bookingRouter=require("./router/bookingRouter");

const app = express();


//MIDDLEWARE

//body parser, reading data from body into req.body
app.use(express.json({limit:"10kb"}));

//cookie parser
app.use(cookieParser());

//serving static files
app.use(express.static(`./public`));

app.set("view engine","pug");

app.set("views",`${__dirname}/views`);




app.use((req,res,next)=>{
    console.log("Hey, I'm middleware");
    next();
})
app.use((req,res,next)=>{
    req.time=new Date().toISOString();
    next();
})
if(process.env.NODE_ENV=="development")
    app.use(morgan('dev'));

//setting security http headers
app.use(helmet());

//data sanitization against NOSQL query injection. 
app.use(mongoSanitize());       //rejects the NOSQL query if injected in req.body,req.params or req.query

//data sanitization against XSS(cross side scripting attacks)
app.use(xss());         //rejects the scripts if injected in req.body,req.params or req.query

//prevent parameter pollution in query parameters
app.use(hpp({
    whitelist:["duration","price","ratingsAverage","difficulty","maxGroupSize","minGroupSize"]
}));

//Limiting the number of requests coming on a particular route
const limiter=rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:"Too many requests from this IP, please try again after an hour"
})
app.use("/api",limiter);

// app.use("/api/v1/users/signin",limiter);

app.use("/",viewRouter);

app.use("/api/v1/tours",tourRouter);                //mounting the routers

app.use("/api/v1/users",userRouter);

app.use("/api/v1/reviews",reviewRouter);

app.use("/api/v1/bookings",bookingRouter);

app.all("*",(req,res,next)=>{
    // res.status(404).json({
    //     status:"fail",
    //     message:`can't find path ${req.originalUrl} on this server`
    // })

    // const err=new Error(`can't find path ${req.originalUrl} on this server`);
    // err.statusCode=404;
    // err.status="fail";
    next(new AppError(`can't find path ${req.originalUrl} on this server`,404));
})

app.use(errorController);

module.exports=app;