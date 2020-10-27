const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const User = require("./../model/userModel");
const factory=require("./handlerFactory");
const multer=require("multer");
const sharp=require("sharp");

//if you don't wanna resize your image
/*const multerStorage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"public/img/users");
    },
    filename:(req,file,cb)=>{
        //user-1234567gh6789-23456778.jpeg
        const type=file.mimetype.split("/")[1];
        const id=req.user._id;
        cb(null,`user-${id}-${Date.now()}.${type}`);
    }
})*/

//If you wanna resize your image
const multerStorage=multer.memoryStorage();         //storing in buffer not in disk

const multerFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith("image"))
        cb(null,true);
    else
        cb(new AppError("Not an image. Please upload only images",400),false);
}

const upload=multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadUserPhoto=upload.single("photo");

exports.resizeUserPhoto=async (req,res,next)=>{
    if(!req.file)
        return next();

    req.file.filename=`user-${req.user._id}.jpeg`;
    await sharp(req.file.buffer).resize(500,500).toFormat("jpeg").jpeg({ quality: 90}).toFile(`public/img/users/${req.file.filename}`);
    next();
}


exports.getAllUsers =factory.getAll(User);

exports.createUser = (req, res) => {
    res.status(200).json({
        status: "success",
        data: "<this route is not updated yet>. Please use /signup"
    })
}
exports.updateUser =factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getUser =factory.getOne(User);

const filterObj = (obj, ...fields) => {
    const filteredObject = {};
    Object.keys(obj).forEach(el => {
        if (fields.includes(el))
            filteredObject[el] = obj[el];
    })
    return filteredObject;
}

exports.updateMe = catchAsync(async (req, res, next) => {

    //1) throw an error if user POSTs a password    
    if (req.body.password || req.body.confirmPassword) {
        return next(new AppError(`This is not a route to update password. Please visit ${req.hostname}/api/v1/updatePassword`));
    }

    //2) update the user document
    const filteredObject = filterObj(req.body, "name", "email");
    if(req.file)
        filteredObject.photo=req.file.filename;

    const updatedUser=await User.findByIdAndUpdate(req.user._id,filteredObject,{
        runValidators:true,
        new:true
    });
    res.status(200).json({
        status: "success",
        user:updatedUser
    })
})

exports.deleteMe=catchAsync(async (req,res,next)=>{
    //Under this we don't delete the user instead of that we mark the user's active property to false
    await User.findByIdAndUpdate(req.user._id,{active:false});
    res.status(204).json({
        status:"success",
        data:null
    })
})

exports.getMe=(req,res,next)=>{
    req.params.id=req.user._id;
    next();
}