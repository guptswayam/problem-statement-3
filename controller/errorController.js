const AppError = require("./../utils/appError");

const errProd = (err, req, res) => {
    if (req.originalUrl.startsWith("/api")) {
        if (err.isOperational)
            res.status(err.statusCode).json({
                status: err.status,
                message: err.msg
            })
        else {
            console.error("ERROR....", err);

            res.status(500).json({
                status: err.status,
                message: "Something goes wrong"
            })
        }
    }
    else {
        if (err.isOperational)
            res.status(200).render("error", {
                msg: err.msg
            })
        else
            res.status(200).render("error", {
                msg: "something went wrong. Try again later..."
            })
    }
}

const errDev = (err, req, res) => {
    if (req.originalUrl.startsWith("/api"))
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    else
        res.status(200).render("error", {
            msg: err.message
        })
}

const handleCastError = (error) => {
    const message = `invalid ${error.path}: ${error.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldError = error => {
    let value = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    value = value.replace(/"/g, "'");
    return new AppError(`Duplicate field value: ${value}`, 400);
}

const handleValidationError = error => {
    let message = Object.values(error.errors).map(el => {
        return el.message;
    });
    message = message.join(". ");
    return new AppError(`Invaid input data! ${message}`, 400);
}
const handleJWTError = (error) => {
    return new AppError("Invalid token. Please login again", 401);
}

const handleTokenExpiredError = error => {
    return new AppError("Your token has expired. Please login again", 401);
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV == "development") {
        errDev(err, req, res);
    }
    else if (process.env.NODE_ENV == "production") {
        let error = { ...err };
        // error.message=err.message;      //If you don't wanna use this.msg in AppError class
        if (err.name == "CastError") {
            error = handleCastError(error);
        }
        if (err.code == 11000) {
            error = handleDuplicateFieldError(error);
        }
        if (err.name == "ValidationError") {
            error = handleValidationError(error);
        }
        if (err.name == "JsonWebTokenError")
            error = handleJWTError(error);
        if (err.name == "TokenExpiredError")
            error = handleTokenExpiredError(error);
        errProd(error, req, res);
    }
}