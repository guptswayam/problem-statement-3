

class APIFeatures{
    constructor(reqQuery,query){
        this.reqQuery=reqQuery;
        this.query=query;
    }
    //1)FILTERING
    filter(){
        //1)(a)FILTERING
        const reqQueryCopy = { ...this.reqQuery };
        const excludedFields = ["page", "limit", "sort", "fields"];
        excludedFields.forEach(el => delete reqQueryCopy[el]);

        //1)(b)ADVANCE FILTERING
        let queryStr = JSON.stringify(reqQueryCopy);
        queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, match => `$${match}`);


        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    //2)SORTING
    sorting(){
        if (this.reqQuery.sort) {
            const sortBy = this.reqQuery.sort.split(",").join(" ");
            // const sortBy=req.query.sort.replace(/,/g," ");
            this.query = this.query.sort(sortBy);
            //query.sort("price ratingsAverage");
        } else {
            this.query = this.query.sort("-ratingsAverage");
        }
        return this;
    }
    //3)LIMITING FIELDS
    async limitingFields(){
        if (this.reqQuery.fields) {
            const fields = this.reqQuery.fields.replace(/,/g, " ");
            // const fields=req.query.fields.split(",").join(" ");
            console.log(fields);
            this.query = this.query.select(fields);
        }
        else
            this.query=this.query.select("-__v");
        this.numDocuments = await this.query;
        this.numDocuments=this.numDocuments.length;
        return this;
    }
    pagination(){
        this.page = this.reqQuery.page * 1 || 1;
        const limit = this.reqQuery.limit * 1 || 100;
        const skip = (this.page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        if (this.reqQuery.page) {
            if (this.numDocuments <= skip)
                throw new Error("invalid page");
        }
        return this;
    }
}
exports.APIFeatures=APIFeatures;