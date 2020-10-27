const express=require("express");
const {getAllUsers,getUser,createUser,updateUser,deleteUser,updateMe,deleteMe,getMe,uploadUserPhoto,resizeUserPhoto}=require("./../controller/userController")
const {signup,signin,forgotPassword,resetPassword,updatePassword,protect,restrictTo,logout}=require("./../controller/authentication");
const bookingRouter= require("./bookingRouter");

const router=express.Router();

router.use("/:userId/bookings",bookingRouter);

router.post("/signup",signup);
router.post("/login",signin);
router.get("/logout",logout);

router.post("/forgotPassword",forgotPassword);
router.patch("/resetPassword/:token",resetPassword);

//This will protect all the remaining routes
router.use(protect);

router.patch("/updatePassword",updatePassword);
router.patch("/updateProfile",uploadUserPhoto,resizeUserPhoto,updateMe);
router.delete("/deleteMe",deleteMe);
router.get("/me",getMe,getUser);

router.use(restrictTo("admin"));

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports=router;