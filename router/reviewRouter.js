const express = require("express");
const { createReview, getAllReviews, deleteReview, updateReview, addTourId, getReview } = require("./../controller/reviewController");
const { protect, restrictTo } = require("./../controller/authentication");
const router = express.Router({ mergeParams: true });

router.use(protect);

router.route("/").post(restrictTo("user"), addTourId, createReview).get(getAllReviews);


router.route("/:id").delete(restrictTo("user", "admin"), deleteReview).patch(restrictTo("user", "admin"), updateReview).get(getReview);


module.exports = router;