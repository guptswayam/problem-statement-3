const mongoose=require("mongoose");
const validator=require("validator");
const crypto=require("crypto");
const bcrypt=require("bcryptjs");

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required: [true,"please provide your name"]
    },
    email:{
        type:String,
        required:[true,"please provide an email"],
        unique:true,
        lowercase: true,
        validate:[validator.isEmail,"please provide a valid email"]
    },
    role:{
        type:String,
        enum:["user","guide","lead-guide","admin"],
        default:"user"
    },
    photo:{
        type:String,
        default: "default.jpg"
    },
    password:{
        type:String,
        required:[true,"please provide a password"],
        minlength:8,
        select:false            //can be overwritten using select()
    },
    confirmPassword:{
        type:String,
        minlength:8,
        required:[true,"please confirm your password"],
        validate:{
            validator: function(el){
                return this.password===el;
            },
            message:"password and confirm password must be same"
        }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:String,
    active:{
        type:Boolean,
        default:true,
        select:false
    }

})

userSchema.pre("save",async function(next){
    if(!this.isModified("password"))
        return next();
    this.password=await bcrypt.hash(this.password,10);
    this.confirmPassword=undefined;
    next();
})

userSchema.methods.correctPassword=async (password,realPassword)=>{
    return await bcrypt.compare(password,realPassword);
};
userSchema.methods.changedPasswordAfterIssue=function(JWTTimeStamp){
    if(this.passwordChangedAt){
        const pca=this.passwordChangedAt.getTime()/1000;
        // console.log(pca,JWTTimeStamp);
        return pca>JWTTimeStamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken=function(){
    const resetToken=crypto.randomBytes(32).toString("hex");
    this.passwordResetToken=crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires=Date.now()+(10*60*1000);
    // console.log(this.passwordResetExpires,this.passwordResetToken);
    return resetToken;
}

userSchema.pre("save",function(next){
    if(!this.isModified("password")||this.isNew)
        return next();
    this.passwordChangedAt=Date.now()-1000;
    next();
})

userSchema.pre(/^find/,function(next){
    //this points to current query
    this.find({active:{$ne:false}});
    next();
})

const User=mongoose.model("User",userSchema);

module.exports=User;