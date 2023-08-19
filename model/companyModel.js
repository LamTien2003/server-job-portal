const mongoose = require('mongoose');
const User = require('./userModel');

const CompanySchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            maxlength: [100, 'Name of Company should be less than 100 character'],
            required: [true, 'Must have name of Company'],
        },
        description: {
            type: String,
            maxlength: [500, 'Description for company should be less than 500 character'],
        },
        establishDate: {
            type: Date,
            required: [true, 'Must have establish date of Company'],
        },
        website: String,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

CompanySchema.virtual('jobList', {
    ref: 'Job',
    foreignField: 'postedBy',
    localField: '_id',
    default: [],
});

const options = { discriminatorKey: 'kind' };
const Company = User.discriminator('Company', CompanySchema, options);

module.exports = Company;
