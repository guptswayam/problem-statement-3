const catchAsync=require("./../utils/catchAsync");
const Tour=require("./../model/tourModel");
const AppError=require("./../utils/appError");
const Booking=require("./../model/bookingModel");

exports.getOverview=catchAsync (async(req,res,next)=>{
    //1) get tour data from collection
    const tours = await Tour.find();
    //2) build and render the template using tour data
    res.status(200).render("overview",{
        title: "All Tours",       //These variables are called as locals in pug file
        tours
    });
})
exports.getTour=catchAsync(async (req,res,next)=>{
    //1) get tour details from the collection
    const tour=  await Tour.findOne({path:req.params.path}).populate({
        path:"reviews",
        select: "review rating user startDates"
    });
    if(!tour)
        return next(new AppError("There is no tour with this name",404));
    let reviewButton;
    if(req.user){
        const booking=await Booking.findOne({user:req.user._id,tour:tour._id});
        console.log(booking);
        if(booking&&new Date(tour.startDates[0]).getTime()<Date.now())
            reviewButton=true;
        else
            reviewButton=false;
    }
    else
        reviewButton=false;
    //2) build and render the template using tour data
    res.status(200).render("tour",{
        title: tour.name,       //These variables are called as locals in pug file
        tour,
        reviewButton
    });
})

exports.login=(req,res,next)=>{
    res.status(200).render("login");
}

exports.account=(req,res,next)=>{
    res.status(200).render("account");
}

exports.resetPassword=(req,res,next)=>{
    res.status(200).render("resetUserPassword",{
        token:req.query.token
    });
}

exports.bookTour=catchAsync(async (req,res,next)=>{
    if(!req.query.tour)
        return next(new AppError(`Cannot find path ${req.originalUrl} on this server`));
    else{
        const tour=await Tour.findById(req.query.tour).select("name price");
        if(!tour)
            return next(new AppError("There is no tour with this id",404));
        

        res.status(200).render("bookTour",{
            tour
        });
    }
})

exports.myBookings=catchAsync(async (req,res,next)=>{
    // #inside populate()
    const booking=await Booking.find({user:req.user._id});
    const tourIds=booking.map(el=>el.tour);
    const tours=await Tour.find({_id:{$in: tourIds}});
    res.status(200).render("overview",{
        title: "My Bookings",
        tours
    });
})

exports.signup=(req,res,next)=>{
    res.status(200).render("signup");
}

exports.addReview=(req,res,next)=>{
    if(req.query.review)
        res.status(200).render("addReview",{
            tour:req.query.tour,
            review: req.query.review
        });
    else
        res.status(200).render("addReview",{
            tour:req.query.tour
        });
}