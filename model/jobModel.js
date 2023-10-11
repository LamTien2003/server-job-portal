const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { skills } = require('../constants/index');

const JobSchema = new mongoose.Schema(
    {
        postedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'Company',
        },

        title: {
            type: String,
            maxlength: [100, 'Title for job should be less than 100 character'],
            required: [true, 'Must have title for job'],
        },
        description: {
            type: String,
            maxlength: [500, 'Description for job should be less than 500 character'],
            required: [true, 'Must have title for job'],
        },
        photosJob: [String],
        skillsRequire: [
            {
                type: String,
                enum: skills,
            },
        ],
        jobRequire: [
            {
                type: String,
                maxlength: [1000, 'Require for job should be less than 1000 character'],
                required: [true, 'Must have job require'],
            },
        ],
        salary: {
            type: Number,
            min: 0,
            required: [true, 'Must have salary for a job'],
        },
        type: {
            type: mongoose.Schema.ObjectId,
            ref: 'CategoryJob',
            required: [true, 'Must have type of job'],
        },
        deadline: {
            type: Date,
            default: dayjs().add(20, 'day'),
        },
        available: {
            type: Boolean,
            default: true,
        },
        isDelete: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

JobSchema.virtual('countApplication', {
    ref: 'JobApplication',
    foreignField: 'job',
    localField: '_id',
    default: [],
    count: true,
});

JobSchema.virtual('applications', {
    ref: 'JobApplication',
    foreignField: 'job',
    localField: '_id',
    default: [],
});

JobSchema.virtual('comments', {
    ref: 'CommentJob',
    foreignField: 'job',
    localField: '_id',
    default: [],
});

const Job = mongoose.model('Job', JobSchema);

module.exports = Job;
