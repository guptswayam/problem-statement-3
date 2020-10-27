const {getAllTours,createTour,getTour,updateTour,deleteTour,aliasTopTours,tourStats,monthlyTours,getToursWithIn,getToursDistance,uploadTourPhotos,resizeTourImages}=require("./../controller/tourController");
const express=require("express");
const {protect,restrictTo}=require("./../controller/authentication");
const router=express.Router();
const reviewRouter=require("./reviewRouter");

// router.param("id",checkId);

router.use("/:tourId/reviews",reviewRouter);

router.route("/top-5-cheap").get(aliasTopTours,getAllTours);
router.route("/tour-status").get(tourStats);
router.route("/monthly-tours/:year").get(protect,restrictTo("admin","lead-guide","guide"),monthlyTours);

router.get("/tours-within/:distance/center/:latlng/unit/:unit",getToursWithIn);

router.get("/tours-distance/:latlng/unit/:unit",getToursDistance);

router.route("/").get(getAllTours).post(protect,restrictTo("admin","lead-guide"),createTour);
router.route("/:id").get(getTour).patch(protect,restrictTo("admin","lead-guide"),uploadTourPhotos,resizeTourImages,updateTour).delete(protect,restrictTo("admin","lead-guide"),deleteTour);


module.exports=router;































// app.get("/api/v1/tours", getAllTours);
// app.post("/api/v1/tours", createTour)
////get tours by id
// app.get("/api/v1/tours/:id",getTour);
// app.patch("/api/v1/tours/:id",updateTour)
// app.delete("/api/v1/tours/:id",deleteTour)