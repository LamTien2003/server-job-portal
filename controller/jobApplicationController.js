const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendResponseToClient } = require('../utils/ultils');

const JobApplication = require('../model/jobApplicationModel');
const Job = require('../model/jobModel');
const Notification = require('../model/notificationModel');

exports.applyJob = catchAsync(async (req, res, next) => {
    if (!(req.user.__t === 'JobSeeker')) {
        return next(new AppError('Chỉ có user thuộc dạng người tìm việc mới có thể apply vào công việc này', 400));
    }

    const job = await Job.findOne({ _id: req.params.id, isDelete: false });
    if (!job) {
        return next(new AppError('Công việc không còn tồn tại', 400));
    }
    if (job.available !== true) {
        return next(new AppError('Công việc này đã bị đóng tạm thời', 400));
    }

    const jobApplication = await JobApplication.findOne({
        company: job.postedBy,
        candicate: req.user._id,
        job: req.params.id,
    });
    if (jobApplication) {
        return next(new AppError('Bạn đã gửi đơn apply vào công việc này rồi', 400));
    }

    const payload = {
        company: job.postedBy,
        candicate: req.user._id,
        job: job._id,
    };
    const newJobApplication = await JobApplication.create(payload);
    await Notification.create({
        sender: req.user._id,
        receiver: job.postedBy,
        content: `${req.user.firstName} ${req.user.lastName} vừa nộp đơn ứng tuyển vào công việc mà bạn đăng tải`,
    });

    return sendResponseToClient(res, 200, {
        status: 'success',
        msg: 'Đã gửi đơn ứng tuyển vào vị trí công việc này',
        data: newJobApplication,
    });
});

exports.acceptJobApplication = catchAsync(async (req, res, next) => {
    if (!(req.user.__t === 'Company')) {
        return next(new AppError('Chỉ có user thuộc dạng Công ty mới có thể thực hiện hành động này', 400));
    }
    const { interviewDate } = req.body;

    const jobApplication = await JobApplication.findOne({ _id: req.params.id });
    if (!jobApplication) {
        return next(new AppError('Không tồn tại đơn ứng tuyển', 400));
    }

    if (jobApplication.company.toString() !== req.user.id) {
        return next(new AppError('Chỉ có công ty tạo ra job này mới có thể chỉnh sửa', 400));
    }

    const job = await Job.findOne({ _id: jobApplication.job, isDelete: false });
    if (!job) {
        return next(new AppError('Công việc không còn tồn tại', 400));
    }
    if (job.available !== true) {
        return next(new AppError('Công việc này đã bị đóng tạm thời', 400));
    }

    jobApplication.status = 'accepted';
    jobApplication.interviewDate = interviewDate;
    await jobApplication.save();

    await Notification.create({
        sender: jobApplication.company,
        receiver: jobApplication.candicate,
        content: `Đơn ứng tuyển của bạn đã được chấp thuận`,
    });

    return sendResponseToClient(res, 200, {
        status: 'success',
        msg: 'Đã chấp thuận đơn ứng tuyển',
        data: jobApplication,
    });
});
exports.cancelJobApplication = catchAsync(async (req, res, next) => {
    if (!(req.user.__t === 'Company')) {
        return next(new AppError('Chỉ có user thuộc dạng Công ty mới có thể thực hiện hành động này', 400));
    }

    const jobApplication = await JobApplication.findOne({ _id: req.params.id });
    if (!jobApplication) {
        return next(new AppError('Không tồn tại đơn ứng tuyển', 400));
    }

    if (jobApplication.company.toString() !== req.user.id) {
        return next(new AppError('Chỉ có công ty tạo ra job này mới có thể chỉnh sửa', 400));
    }

    const job = await Job.findOne({ _id: jobApplication.job, isDelete: false });
    if (!job) {
        return next(new AppError('Công việc không còn tồn tại', 400));
    }

    jobApplication.status = 'canceled';
    jobApplication.interviewDate = undefined;
    await jobApplication.save();
    await Notification.create({
        sender: jobApplication.company,
        receiver: jobApplication.candicate,
        content: `Đơn ứng tuyển của bạn đã bị từ chối`,
    });

    return sendResponseToClient(res, 200, {
        status: 'success',
        msg: 'Đã từ chối đơn ứng tuyển',
        data: jobApplication,
    });
});
exports.removeJobApplication = catchAsync(async (req, res, next) => {
    if (!(req.user.__t === 'JobSeeker')) {
        return next(new AppError('Chỉ có user thuộc dạng người tìm việc mới có thể thực hiện hành động này', 400));
    }

    const jobApplication = await JobApplication.findOne({ _id: req.params.id, candicate: req.user._id });
    if (!jobApplication) {
        return next(new AppError('Không tồn tại đơn ứng tuyển hoặc đơn ứng tuyển này không thuộc về bạn', 400));
    }
    if (jobApplication.status !== 'pending') {
        return next(new AppError('Đơn ứng tuyển này không ở trạng thái chờ duyệt để có thể hủy bỏ', 400));
    }

    await JobApplication.deleteOne({ _id: req.params.id, candicate: req.user._id });

    return sendResponseToClient(res, 204, {
        status: 'success',
        msg: 'Đã xóa đơn ứng tuyển',
    });
});