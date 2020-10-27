const Booking=require("./../model/bookingModel");
const factory=require("./handlerFactory");
const {restrictTo} = require("./authentication")

exports.addbooking=factory.createOne(Booking);

exports.getAllBookings=factory.getAll(Booking);

exports.bookingsRestrictTo= (req,res,next)=>{
    if(req.params.userId){
        req.restrictPeoples=["user","admin","lead-guide"];
    }
    else
        req.restrictPeoples=["admin","lead-guide"];
    next();
}