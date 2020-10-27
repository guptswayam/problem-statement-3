const User = require("./../model/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const Email = require("./../utils/email");
const crypto = require("crypto");


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const sendJwtToken = (user, statusCode, res) => {
    const jwtToken = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)),
        httpOnly: true           //cookie can't be accessed or modified
    }
    if (process.env.NODE_ENV == "production")
        cookieOptions.secure = true;            //cookie can only be sent over https

    res.cookie("jwt", jwtToken, cookieOptions);
    user.password = undefined;
    res.status(statusCode).json({
        status: "success",
        token: jwtToken,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    });

    // await new Email(newUser,`${req.protocol}://${req.get("host")}/me`).sendWelcome();

    sendJwtToken(newUser, 201, res);
});

exports.signin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //1) Check if email and password exist
    if (!email || !password)
        return next(new AppError("please provide email and password", 400));

    //2) Check if user exists and password is correct
    const user = await User.findOne({ email: email }).select("+password");

    if (!(user && await user.correctPassword(password, user.password)))
        return next(new AppError("invalid email or password", 401));
    //3) if everything ok, send token to client
    sendJwtToken(user, 200, res);
});

exports.logout = (req, res, next) => {
    res.cookie("jwt","LoggedIn",{
        expires: new Date(Date.now()+2000),
        httpOnly: true
    })
    res.status(200).json({status: "success"});
}

exports.protect = catchAsync(async (req, res, next) => {
    //1) check the existence of token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token)
        return next(new AppError("You are not logged in, please login to get access", 401));
    //2) verify the token

    // jwt.verify(token,process.env.JWT_SECRET,(err,data)=>{
    //     decoded=data;
    // });

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //3) check if the user still exists
    const currentUser = await User.findById(decoded.id);

    if (!currentUser)
        return next(new AppError("The user belongs to this token does no longer exist", 401));

    //4) check if user changed the password after JWT was issued
    if (currentUser.changedPasswordAfterIssue(decoded.iat))
        return next(new AppError("You changed the password please login again"));

    //5) Grant access to protected route
    req.user = currentUser;
    res.locals.user= currentUser;
    next();
});

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const token = req.cookies.jwt;
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
            //3) check if the user still exists
            const currentUser = await User.findById(decoded.id);

            if (!currentUser)
                return next();

            //4) check if user changed the password after JWT was issued
            if (currentUser.changedPasswordAfterIssue(decoded.iat))
                return next();
            res.locals.user = currentUser;
            req.user= currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
}

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(req.restrictPeoples)
            roles=req.restrictPeoples;
        if (!roles.includes(req.user.role))
            return next(new AppError("You don't have permission to perform this action"));
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) check user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user)
        return next(new AppError("There is no user with this email address", 404));
    //2) generate the random reset token
    const resetToken = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    
    

    try {
        //3) send it to user's email
        const resetURL = `${req.protocol}://${req.hostname}/api/v1/users/resetPassword/${resetToken}`;
        // const message = `Forgot Your Password? Submit a PATCH request with new password and confirmPassword to: ${resetURL}.\n\nIf you didn't forget your password please ignore this email`;
        // await sendMail({
        //     email: user.email,
        //     subject: "Your password reset token(valid for 10 minutes)",
        //     message
        // })

        await new Email(user,resetToken).sendPasswordResetMail();

        res.status(200).json({
            status: "success",
            message: "Token sent to email"
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError("Error during sending an email. Try again later..."));
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) get the user based on the token and check the validity of token
    const token = crypto.createHash("sha256").update(req.params.token).digest("hex");
    console.log(token);
    const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });

    if (!user)
        return next(new AppError("invalid token or token has expired", 400));
    //2) set the new password 
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //3)update the changedPasswordAt property
    //this is done using document middleware 

    //4) log the user in, send JWT
    sendJwtToken(user, 200, res);

})

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1) get the user from the collection
    const currentUser = await User.findById(req.user._id).select("+password");
    //2) check if POSTed current password is correct
    if (!await currentUser.correctPassword(req.body.currentPassword, currentUser.password))
        return next(new AppError("Your current password is incorrect",400));
    currentUser.password = req.body.password;
    currentUser.confirmPassword = req.body.confirmPassword;
    //4) If so, update password
    await currentUser.save();

    //4) Log user in, send JWT
    sendJwtToken(currentUser, 200, res);


})