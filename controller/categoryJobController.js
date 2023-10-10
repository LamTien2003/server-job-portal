const catchAsync = require('../utils/catchAsync');
const { sendResponseToClient } = require('../utils/ultils');

const CategoryJob = require('../model/categoryJobModel');

exports.getAllCategoryJob = catchAsync(async (req, res, next) => {
    const listCategoryJob = await CategoryJob.find({});
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
