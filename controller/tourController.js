const Tour = require("./../model/tourModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");
const multer = require("multer");
const sharp = require("sharp");

const multerStorage = multer.memoryStorage();         //storing in buffer not in disk

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image"))
        cb(null, true);
    else
        cb(new AppError("Not an image. Please upload only images", 400), false);
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

//for uploading multiple images from different fields
exports.uploadTourPhotos = upload.fields([
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 3 }
])

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files)
        return next();

    if (req.files.imageCover) {
        req.body.imageCover = `tours-${req.params.id}-cover.jpeg`
        await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1333)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${req.body.imageCover}`);
    }
    if (req.files.images) {
        req.body.images = [];
        await Promise.all(
            req.files.images.map(async (file, index) => {
                const filename = `tours-${req.params.id}-${index + 1}.jpeg`;
                await sharp(file.buffer)
                    .resize(2000, 1333)
                    .toFormat("jpeg")
                    .jpeg({ quality: 90 })
                    .toFile(`public/img/tours/${filename}`);

                req.body.images.push(filename);
            })
        )
    }


    next();
})

//for uploading mutiple images from a single field
// upload.array("images",5);

exports.createTour = factory.createOne(Tour);
exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: "reviews" });
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = "-ratingsAverage price";
    next();
}

exports.tourStats = async (req, res) => {
    try {
        const tourStat = await Tour.aggregate([
            {
                $match: { price: { $gte: 100 } }
            },
            {
                $group: {
                    _id: "$difficulty",
                    numTours: { $sum: 1 },
                    ratingsAvg: { $avg: "$ratingsAverage" },
                    avgPrice: { $avg: "$price" },
                    numRatings: { $sum: "$ratingsQuantity" },
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" }
                }
            },
            {
                $sort: { avgPrice: 1 }
            },
            // {
            //     $match:{_id:"easy"}
            // }
        ])
        res.status(200).json({
            status: "success",
            results: tourStat.length,
            data: tourStat
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            status: "fail",
            message: err
        })
    }

}
exports.monthlyTours = async (req, res) => {
    try {
        const plan = await Tour.aggregate([
            {
                $unwind: "$startDates"
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${req.params.year}-1-1`),
                        $lte: new Date(`${req.params.year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$startDates" },
                    numTours: { $sum: 1 },
                    tours: { $push: "$name" },
                    prices: { $push: "$price" },
                    startDates: { $push: "$startDates" },
                }
            },
            {
                $addFields: { month: "$_id" }
            },
            {
                $project: { _id: 0 }
            },
            {
                $sort: { numTours: -1 }
            }
        ])
        res.status(200).json({
            status: "success",
            results: plan.length,
            data: plan
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            status: "fail",
            message: err
        })
    }
}

exports.getToursWithIn = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, long] = latlng.split(",");

    const radius = unit == "mi" ? (distance * 1) / 3958.8 : (distance * 1) / 6378.1;
    if (!lat || !long)
        return next(new AppError("Invalid parameters!!!"));
    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[long, lat], radius] } } });

    res.status(200).json({
        status: "success",
        results: tours.length,
        data: tours
    })
})
exports.getToursDistance = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, long] = latlng;
    const multiplier = unit == "mi" ? 0.000621371 : 0.001;

    if (!lat || !long)
        return next(new AppError("Invalid parameters!!!"));
    const distances = await Tour.aggregate([
        //geoNear must be the first stage of pipeline
        //if we have only one geospatial index then there is no need to specify a field as "key". It autmatically detects the field.
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [long * 1, lat * 1]
                },
                distanceField: "distance",
                distanceMultiplier: multiplier
            },

        },
        {
            $project: {
                name: 1,
                distance: 1
            }
        }
    ])
    res.status(200).json({
        status: "success",
        data: distances
    })
})


































































































/*
const fs = require("fs");

const tours = JSON.parse(fs.readFileSync("__dirname/../dev-data/data/tours-simple.json", "utf-8"));


//ROUTE HANDLERS
exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: "success",
        results: tours.length,
        tours: tours
    })
}

exports.getTour = (req, res) => {
    const newId = parseInt(req.params.id);
    const tour = tours.find(el => el.id === newId);
        res.status(200).json({
            status: "success",
            data: tour
        })
}

exports.createTour = (req, res) => {
    // console.log(req.body);
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
    tours.push(newTour);
    fs.writeFile("./dev-data/data/tours-simple.json", JSON.stringify(tours), err => {
        res.status(200).json({
            status: "success",
            requested_at: req.time,
            data: newTour
        })
    })
}
exports.updateTour = (req, res) => {
        res.status(200).json({
            status: "success",
            tour: "<updated tour>"
        })
}
exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: "success",
        data: null
    })
}
exports.checkId = (req, res, next, val) => {
    if (val * 1 > tours.length - 1) {
        res.status(404).json({
            status: "fail",
            data: "invalid id"
        })
        next(false);
    }
    else {
        next();
    }
}
exports.checkBody=(req,res,next)=>{
    if(req.body.price&&req.body.name){
        next();
    }
    else{
        next(false);
        res.status(400).json({
            status:"fail",
            data : "name or price is missing"
        })
    }
}
*/