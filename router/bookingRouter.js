const express=require("express")
const router=express.Router({mergeParams: true});
const {protect,restrictTo}=require("./../controller/authentication");
const bookingController=require("./../controller/bookingController");

router.route("/").post(protect,bookingController.addbooking).get(protect,bookingController.bookingsRestrictTo,restrictTo(),bookingController.getAllBookings);

module.exports=router;