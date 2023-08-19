const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendResponseToClient } = require('../utils/ultils');
const APIFeatures = require('../utils/apiFeatures');

const Company = require('../model/companyModel');

exports.getAllCompany = catchAsync(async (req, res, next) => {
    const companyQuery = new APIFeatures(Company.find({}), req.query).paginate().filter().search('companyName');
    const companys = await companyQuery.query;
    return sendResponseToClient(res, 200, {
        status: 'success',
        data: companys,
    });
});
exports.getCompany = catchAsync(async (req, res, next) => {
    const company = await Company.findById(req.params.id).populate([
        {
            path: 'follows',
            select: 'firstName lastName photo',
        },
        ,
        {
            path: 'followers',
            select: 'firstName lastName photo',
        },
        {
            path: 'jobList',
            select: 'title description photosJob salary type available isDelete',
            populate: [{ path: 'countApplication' }],
        },
    ]);
    if (!company) {
        return next(new AppError('This company is nolonger exist', 400));
    }
    return sendResponseToClient(res, 200, {
        status: 'success',
        data: company,
    });
});
exports.changeMe = catchAsync(async (req, res, next) => {
    if (req.user.__t !== 'Company') {
        return next(new AppError('Chỉ có user thuộc dạng Công ty mới có thể thực hiện thao tác này', 400));
    }
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'Đường dẫn này không dùng để thay đổi mật khẩu. Vui lòng dùng /updateMyPassword để thay thế',
                400,
            ),
        );
    }

    const { firstName, lastName, location, gender, phoneNumber } = req.body;
    if (firstName || lastName || location || gender || phoneNumber) {
        return next(
            new AppError(
                'Đường dẫn này dùng để thay đổi các thông tin cụ thể của Company. Vui lòng sử dụng /user/changeMe để thay đổi các thông tin cơ bản của người dùng',
                400,
            ),
        );
    }
    const { introduce, cvImage, skills, educate, certificate, experiences, projects } = req.body;
    if (introduce || cvImage || skills || educate || certificate || experiences || projects) {
        return next(
            new AppError(
                'Đường dẫn này không dùng để thay đổi các thông tin cụ thể của JobSeeker. Vui lòng sử dụng /jobseeker/changeMe để thay thế',
                400,
            ),
        );
    }

    const { companyName, description, establishDate, website } = req.body;

    const changeInfo = {
        companyName,
        description,
        establishDate,
        website,
    };

    if (req?.file?.filename) {
        changeInfo.cvImage = req.file.filename;
    }

    const company = await Company.findByIdAndUpdate(req.user.id, changeInfo, {
        new: true,
        runValidators: true,
    });

    return sendResponseToClient(res, 200, {
        status: 'success',
        data: company,
    });
});
