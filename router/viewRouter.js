const express=require("express");
const router=express.Router();
const {protect,isLoggedIn}=require("./../controller/authentication");
const viewController=require("./../controller/viewController");



router.get("/",isLoggedIn,viewController.getOverview);
router.get("/tour/:path",isLoggedIn,viewController.getTour);
router.get("/login",isLoggedIn,viewController.login);
router.get("/signup",isLoggedIn,viewController.signup);
router.get("/me",protect,viewController.account)
router.get("/reset-password",viewController.resetPassword);
router.get("/book-tour",protect,viewController.bookTour);
router.get("/my-bookings",protect,viewController.myBookings);
router.get("/add-review",protect,viewController.addReview);

module.exports=router;