const catchAsync = require('../utils/catchAsync');
const { sendResponseToClient } = require('../utils/ultils');

const CategoryJob = require('../model/categoryJobModel');
const AppError = require('../utils/appError');

exports.getAllCategoryJob = catchAsync(async (req, res, next) => {
    const listCategoryJob = await CategoryJob.find({}).populate('totalJobs');
    return sendResponseToClient(res, 200, {
        status: 'success',
        data: listCategoryJob,
    });
});

exports.createCategoryJob = catchAsync(async (req, res, next) => {
    const newCategoryJob = await CategoryJob.create({
        categoryName: req.body.categoryName,
    });
    return sendResponseToClient(res, 200, {
        status: 'success',
        msg: 'Tạo danh mục công việc mới thành công',
        data: newCategoryJob,
    });
});

exports.deleteCategoryJob = catchAsync(async (req, res, next) => {
    const categoryJob = await CategoryJob.findByIdAndDelete(req.params.id);
    if (!categoryJob) {
        return next(new AppError('Danh mục ngành nghề không tồn tại', 400));
    }
    return sendResponseToClient(res, 200, {
        status: 'success',
        msg: 'Xóa danh mục thành công',
    });
});

exports.changeCategoryJob = catchAsync(async (req, res, next) => {
    const { categoryName, isHotCategory } = req.body;
    const payload = {};
    if (categoryName) payload.categoryName = categoryName;
    if (isHotCategory) payload.isHotCategory = isHotCategory;

    const categoryJob = await CategoryJob.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true,
    });
    if (!categoryJob) {
        return next(new AppError('Danh mục ngành nghề không tồn tại', 400));
    }
    return sendResponseToClient(res, 200, {
        status: 'success',
        msg: 'Thay đổi thông tin thành công',
        data: categoryJob,
    });
});
