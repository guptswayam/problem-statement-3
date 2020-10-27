const catchAsync=require("./../utils/catchAsync");
const Review=require("./../model/reviewModel");
const factory=require("./handlerFactory");

exports.addTourId=(req,res,next)=>{
    if(!req.body.tour)
        req.body.tour=req.params.tourId;
    req.body=Object.assign({user:req.user._id},{createdAt:new Date(Date.now()+(330*60*1000)).toISOString()},req.body);
    next();
}

exports.createReview=factory.createOne(Review);

exports.getAllReviews=factory.getAll(Review);

exports.deleteReview=factory.deleteOne(Review);

exports.updateReview=factory.updateOne(Review);

exports.getReview=factory.getOne(Review);