const mongoose=require("mongoose");

const bookingSchema=mongoose.Schema({
    tour:{
        type: mongoose.Schema.ObjectId,
        ref: "Tour"
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    tourist:{
        type: String,
        required: [true,"Booking must have a tourist name"]
    },
    age:{
        type: Number,
        required: [true,"Booking must have a tourist age"]
    },
    price:{
        type: Number,
        required: [true,"Booking must have a price"]
    },
    createdAt:{
        type: Date,
        default: Date.now()
    }
})

const Booking=mongoose.model("Booking",bookingSchema);

module.exports=Booking;