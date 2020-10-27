const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "A review should not be empty"]
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, "A review must have a rating"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "A review must belongs to an user"]
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "A review must belongs to a tour"]
    }
})

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
        select: "name photo"
    });
    next();
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: "$tour",
                ratingsQuantity: { $sum: 1 },
                ratingsAverage: { $avg: "$rating" }
            }
        }
    ])
    if (stats.length > 0)
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: stats[0].ratingsAverage,
            ratingsQuantity: stats[0].ratingsQuantity
        })
    else
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0
        })
}

reviewSchema.index({ user: 1, tour: 1 },{unique: true});

reviewSchema.post("save", function (doc, next) {
    //this or doc points to current document which is saved
    this.constructor.calcAverageRatings(this.tour);
    next();
})

//findByIdAndUpdate and findByIdAndDelete indirectly calls findOneAndUpdate and findByIdAndDelete
reviewSchema.post(/^findOneAnd/, function (doc, next) {
    if (doc)
        doc.constructor.calcAverageRatings(doc.tour);
    next();
})

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;