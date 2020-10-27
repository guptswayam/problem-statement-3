const mongoose = require("mongoose");

const tourSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "name must be present"],
        unique: true,
        trim: true,
        minlength: [5, "A Tour name must have minimum length of 5"],
        maxlength: [40, "A tour name has maximum length of 40"],
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    duration: {
        type: Number,
        required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have group size"]
    },
    path: String,
    difficulty: {
        type: String,
        default: "medium",
        enum: {
            values: ["easy", "medium", "difficult"],
            message: "A tour difficulty is either easy, hard or difficult"
        }
    },
    discount: {
        type: Number,
        validate: {
            validator: function (value) {
                //this will not work on update request
                return this.price > value;
            },
            message: "Discount price must be smaller than original price"
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, "A tour must has minimum rating of 1"],
        max: [5, "A tour must has maximum rating of 5"],
        set: value=> Math.round(value*10)/10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    summary: {
        type: String,
        required: [true, "A tour must have a summary"]
    },
    description: String,
    imageCover: {
        type: String,
        required: [true, "A tour must have an image"]
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: {
        type: [Date],
        required: [true, "A tour must have start dates"]
    },
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        //GeoSpatial locations:-These are the locations of the places on earth in latitude and longitude. They must have type and coordinates
        type: {
            type: String,
            default: "Point",
            enum: ["Point"]
        },
        coordinates: [Number],      //It is in sequence of longitude then latitude(every place in mongodb)
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: "Point",
                enum: ["Point"],
            },
            coordinates: [Number],
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

//adding indexes to improve read performance
// tourSchema.index({price:1});
tourSchema.index({ price: 1, ratingsAverage: -1 });     //compound indexes,no need to write single file indexes for the first field in compound index
tourSchema.index({ path: 1 });            //single field indexes
tourSchema.index({ ratingsAverage: -1 });
tourSchema.index({startLocation: "2dsphere"});      //If we add a field as index then It must be there when we add a document

//Virtual Properties:- These are the properties which are not saved into the database but rendered to the user
tourSchema.virtual("minGroupSize").get(function () {
    return Math.ceil(this.maxGroupSize / 4);
})

//Virtual Populate:- It is a process of embedding the different collection documents without persisting it into the database during rendering. It is used when we are using parent referencing.
tourSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "tour",
    localField: "_id"
})

//Document Middleware:-These are executed when we save our document to the database using create() or save() method only

//pre-document middleware runs before the document be save
tourSchema.pre("save", function (next) {
    this.path = this.name.replace(/ /g, "-").toLowerCase();
    next();
})

//embedding or denormalization of data for tour guides in data-modelling concept
/*tourSchema.pre("save",async function(next){
    const guidesPromise=this.guides.map(async id=>await User.findById(id));
    this.guides=await Promise.all(guidesPromise);
    next();
})*/

//post-document middleware runs after the document is saved
/*tourSchema.post("save",function(doc,next){
    console.log("Hey, Post Middleware");
    next();
})*/

//Query Middleware:- It is executed before or after the query get executed.It is also of two types
tourSchema.pre(/^find/, function (next) {          //regex is used to call query methods that starts with find keyword. Eg. findById()
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: "guides",
        select: "-__v -passwordChangedAt"
    })
    next();
})

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Time taken to execute query is ${Date.now() - this.start} milliseconds`);
    next();
})

//Aggregation Middleware

tourSchema.pre("aggregate", function (next) {
    this.pipeline().push({ $match: { secretTour: { $ne: true } } });
    next();
})


const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;



// const testTour=new Tour({
//     name: "The Forest Hiker",
//     price:998,
//     rating : 4.9
// })
// testTour.save().then(doc=>{
//     console.log(doc);
// }).catch(err=>{
//     console.log("Error while saving");
// })