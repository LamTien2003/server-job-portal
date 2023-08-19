const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendResponseToClient } = require('../utils/ultils');
const APIFeatures = require('../utils/apiFeatures');

const Job = require('../model/jobModel');
const CommentJob = require('../model/commentJobModel');

exports.getAllJob = catchAsync(async (req, res, next) => {
    const jobsQuery = new APIFeatures(
        Job.find({ isDelete: false }).populate([
            {
                path: 'postedBy',
                select: 'companyName description establishDate location photo',
            },
            {
                path: 'countApplication',
            },
        ]),
        req.query,
    )
        .filter()
        .paginate()
        .sort()
        .search('title');

    const jobs = await jobsQuery.query;
    if (!jobs) {
        return next(new AppError('Không có công việc nào không còn tồn tại', 400));
    }
    return sendResponseToClient(res, 200, {
        status: 'success',
        data: jobs,
    });
});

exports.getJob = catchAsync(async (req, res, next) => {
    const job = await Job.findOne({ _id: req.params.id, isDelete: false }).populate([
        {
            path: 'postedBy',
            select: 'companyName description establishDate location photo',
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
    ]);
    if (!job) {
        return next(new AppError('Công việc không còn tồn tại', 400));
    }
    return sendResponseToClient(res, 200, {
        status: 'success',
        data: job,
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

    const { title, description, skillsRequire, jobRequire, salary, type } = req.body;
    const payload = {
        title,
        description,
        skillsRequire,
        jobRequire,
        salary,
        type,
        postedBy: req.user.id,
    };
    if (req?.files?.filename) {
        payload.photosJob = req.files.filename;
    }

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
