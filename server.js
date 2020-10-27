const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });

process.on("uncaughtException", err => {
    console.log("ERROR: UNCAUGHT EXCEPTION");
    console.error(err.name, ": ", err.message);
    process.exit(1);
})


const app = require("./app");

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log("connection established");
})
// .catch(err=>console.log("ERROR"));



const port_no = process.env.PORT || 5000;
const server = app.listen(port_no, () => {
    console.log("App is running under port 5000 \nwating for requests...");
})

process.on("unhandledRejection", err => {
    console.log("ERROR: UNHANDLED REJECTION");
    console.error(err.name, ": ", err.message);
    server.close(() => {
        process.exit(1);
    })
});
