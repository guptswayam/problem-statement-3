const catchAsync=require("./../utils/catchAsync");
const AppError=require("./../utils/appError");
const { APIFeatures } = require("./../utils/apiFeatures");

exports.deleteOne=Model=> catchAsync(async (req, res,next) => {
    const doc=await Model.findByIdAndDelete(req.params.id);
    if(!doc)
        return next(new AppError("No document exist with this id",404));
    res.status(204).json({
        status: "success",
        data: null
    })
});

exports.updateOne=Model=> catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!doc) {
        next(new AppError(`No document find with this ID`, 404));
        return;
    }
    res.status(200).json({
        status: "success",
        data: doc
    })
});

exports.createOne=Model=> catchAsync(async (req, res) => {
    req.body.createdAt=new Date().toISOString();
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: "success",
        data: doc
    })
});

exports.getOne=(Model,populateOptions)=> catchAsync(async (req, res, next) => {
    let query = Model.findOne({_id:req.params.id});
    if(populateOptions)
        query=query.populate(populateOptions);
    const doc=await query;
    // const tour = await Tour.findOne({_id:req.params.id});
    if (!doc) {
        next(new AppError(`No doc find with this ID`, 404));
        return;
    }
    doc.__v=undefined;
    res.status(200).json({
        status: "success",
        data: doc
    })
});

exports.getAll=Model=> catchAsync(async (req, res) => {
    //this is for getAllReviews only
    const filter={}
    if(req.params.tourId)
        filter.tour=req.params.tourId;

    //this is for getAllBookings only
    if(req.params.userId)
        filter.user=req.params.userId;

    //BUILD QUERY
    let query = Model.find(filter);
    let features = await new APIFeatures(req.query, query).filter().sorting()
        .limitingFields();
    features = features.pagination();

    //EXECUTE QUERY
    const docs = await features.query;     //query is not executed untill we await for it.

    //SEND BACK RESPONSE
    res.status(200).json({
        status: "success",
        results: docs.length,
        totalResults: features.numDocuments,
        page: features.page,
        data: docs
    })
});
