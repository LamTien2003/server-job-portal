const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendResponseToClient } = require('../utils/ultils');
const APIFeatures = require('../utils/apiFeatures');

const CategoryJob = require('../model/categoryJobModel');
const JobApplication = require('../model/jobApplicationModel');
const Company = require('../model/companyModel');
const Job = require('../model/jobModel');
const CommentJob = require('../model/commentJobModel');

exports.getAllJob = catchAsync(async (req, res, next) => {
    const jobsQuery = new APIFeatures(
        Job.aggregate([
            {
                $lookup: {
                    from: Company.collection.name,
                    localField: 'postedBy',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                companyName: 1,
                                coverPhoto: 1,
                                description: 1,
                                establishDate: 1,
                                location: 1,
                                photo: 1,
                            },
                        },
                    ],
                    as: 'postedBy',
                },
            },
            {
                $lookup: {
                    from: CategoryJob.collection.name,
                    foreignField: '_id',
                    localField: 'type',
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                categoryName: 1,
                                isHotCategory: 1,
                            },
                        },
                    ],
                    as: 'type',
                },
            },
            {
                $lookup: {
                    from: JobApplication.collection.name,
                    foreignField: 'job',
                    localField: '_id',
                    as: 'applications',
                },
            },
            {
                $unwind: '$postedBy',
            },
            {
                $unwind: '$type',
            },
            {
                $set: {
                    countApplication: { $size: '$applications' },
                },
            },
            { $match: { 'postedBy.ban': { $ne: true } } },
        ]),
        req.query,
    )
        .filter()
        .paginate()
        .sort()
        .search('title');

    const jobs = await jobsQuery.query;
    const totalItems = await Job.find().merge(jobsQuery.query).skip(0).limit(0).count();
    if (!jobs) {
        return next(new AppError('Không có công việc nào không còn tồn tại', 400));
    }
    return sendResponseToClient(res, 200, {
        status: 'success',
        data: jobs,
        totalItems,
    });
});

exports.getAllJobAccepted = catchAsync(async (req, res, next) => {
    const jobsQuery = new APIFeatures(
        Job.find({ isDelete: false, isAccepted: true }).populate([
            {
                path: 'postedBy',
                select: 'companyName coverPhoto description establishDate location photo',
                match: { ban: { $ne: true } },
            },
            {
                path: 'countApplication',
            },
            {
                path: 'type',
                select: 'categoryName isHotCategory',
            },
        ]),
        req.query,
    )
        .filter()
        .paginate()
        .sort()
        .search('title');

    const result = await jobsQuery.query;
    const totalItems = await Job.find().merge(jobsQuery.query).skip(0).limit(0).count();
    const jobs = result.filter((item) => item.postedBy !== null);
    if (!jobs) {
        return next(new AppError('Không có công việc nào không còn tồn tại', 400));
    }
    return sendResponseToClient(res, 200, {
        status: 'success',
        data: jobs,
        totalItems,
    });
});

exports.getAllJobNotAcceptYet = catchAsync(async (req, res, next) => {
    const jobsQuery = new APIFeatures(Job.find({ isAccepted: false, isDelete: false }), req.query)
        .filter()
        .paginate()
        .sort();
    const totalItems = await Job.find().merge(jobsQuery.query).skip(0).limit(0).count();

    const jobs = await jobsQuery.query;
    return sendResponseToClient(res, 200, {
        status: 'success',
        data: jobs,
        totalItems,
    });
});

exports.getAllJobDeleted = catchAsync(async (req, res, next) => {
    if (!(req.user.__t === 'Company')) {
        return next(new AppError('Chỉ có user thuộc dạng Công ty mới có thể thực hiện hành động này', 400));
    }
    const jobsQuery = new APIFeatures(Job.find({ postedBy: req.user.id, isDelete: true }), req.query)
        .filter()
        .paginate()
        .sort();

    const jobs = await jobsQuery.query;
    const totalItems = await Job.find().merge(jobsQuery.query).skip(0).limit(0).count();

    return sendResponseToClient(res, 200, {
        status: 'success',
        data: jobs,
        totalItems,
    });
});

exports.getJob = catchAsync(async (req, res, next) => {
    const job = await Job.findOne({ _id: req.params.id, isDelete: false, isAccepted: true }).populate([
        {
            path: 'postedBy',
            select: 'companyName coverPhoto description establishDate location photo',
        },
        {
            path: 'applications',
            populate: {
                path: 'candicate',
                select: 'firstName lastName photo ',
            },
        },
        {
            path: 'comments',
            populate: {
                path: 'sender',
                select: 'firstName lastName photo ',
            },
        },
        {
            path: 'type',
            select: 'categoryName isHotCategory',
        },
    ]);
    if (!job) {
        return next(new AppError('Công việc không còn tồn tại', 400));
    }
    return sendResponseToClient(res, 200, {
        status: 'success',
        data: job,
    });
});

exports.approveJob = catchAsync(async (req, res, next) => {
    const job = await Job.findOne({ _id: req.params.id, isDelete: false });
    if (job.isAccepted) {
        return next(new AppError('Công việc này đã được duyệt trước đó', 400));
    }
    const newJob = await Job.findByIdAndUpdate(
        req.params.id,
        { isAccepted: true },
        {
            new: true,
            runValidators: true,
        },
    );

    return sendResponseToClient(res, 200, {
        status: 'success',
        msg: 'Phê duyệt công việc thành công',
        data: newJob,
    });
});
exports.rejectJob = catchAsync(async (req, res, next) => {
    const job = await Job.findOne({ _id: req.params.id, isDelete: false });
    if (!job.isAccepted) {
        return next(new AppError('Công việc này chưa ở trạng thái phê duyệt để có thể tiến hành hủy phê duyệt', 400));
    }
    const newJob = await Job.findByIdAndUpdate(
        req.params.id,
        { isAccepted: false },
        {
            new: true,
            runValidators: true,
        },
    );

    return sendResponseToClient(res, 200, {
        status: 'success',
        msg: 'Đã hủy phê duyệt công việc',
        data: newJob,
    });
});

exports.commentJob = catchAsync(async (req, res, next) => {
    const job = await Job.findOne({ _id: req.params.id, isDelete: false });
    if (!job) {
        return next(new AppError('Công việc không còn tồn tại', 400));
    }

    const commentJob = await CommentJob.create({
        job: job._id,
        sender: req.user._id,
        content: req.body.content,
    });
    return sendResponseToClient(res, 200, {
        status: 'success',
        msg: 'Bình luận đã được đăng tải',
        data: commentJob,
    });
});

exports.createJob = catchAsync(async (req, res, next) => {
    if (!(req.user.__t === 'Company')) {
        return next(new AppError('Chỉ có user thuộc dạng Công ty mới có thể tạo công việc mới', 400));
    }

    const { title, description, skillsRequire, jobRequire, salary, type, deadline, numberRecruitment } = req.body;
    const payload = {
        title,
        description,
        jobRequire,
        salary,
        type,
        deadline,
        numberRecruitment,
        postedBy: req.user.id,
    };
    if (skillsRequire) {
        payload.skillsRequire = JSON.parse(skillsRequire);
    }
    if (req?.files?.filename) {
        payload.photosJob = req.files.filename;
    }
    console.log(payload);
    const job = await Job.create(payload);
    return sendResponseToClient(res, 200, {
        status: 'success',
        msg: 'Tạo công việc mới thành công',
        data: job,
    });
});

exports.removeJob = catchAsync(async (req, res, next) => {
    if (!(req.user.__t === 'Company')) {
        return next(new AppError('Chỉ có user thuộc dạng Công ty mới có thể thực hiện hành động này', 400));
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
        return next(new AppError('Job này hiện không còn tồn tại', 400));
    }

    job.isDelete = true;
    await job.save();

    return sendResponseToClient(res, 204, {
        status: 'success',
        message: 'Xóa thành công, công việc đã được xóa và thêm vào kho lưu trữ',
        data: job,
    });
});
exports.deleteJob = catchAsync(async (req, res, next) => {
    if (!(req.user.__t === 'Company')) {
        return next(new AppError('Chỉ có user thuộc dạng Công ty mới có thể thực hiện hành động này', 400));
    }

    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
        return next(new AppError('Job này hiện không còn tồn tại', 400));
    }

    return sendResponseToClient(res, 204, {
        status: 'success',
        message: 'Đã xóa vĩnh viễn công việc này',
    });
});

exports.restoreJob = catchAsync(async (req, res, next) => {
    if (!(req.user.__t === 'Company')) {
        return next(new AppError('Chỉ có user thuộc dạng Công ty mới có thể thực hiện hành động này', 400));
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
        return next(new AppError('Job này hiện không còn tồn tại', 400));
    }

    job.isDelete = false;
    await job.save();

    return sendResponseToClient(res, 200, {
        status: 'success',
        message: 'Khôi phục công việc thành công',
        data: job,
    });
});
