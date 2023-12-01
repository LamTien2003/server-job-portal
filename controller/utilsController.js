const axios = require('axios');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendResponseToClient } = require('../utils/ultils');

const { skills } = require('../constants/index');

exports.getSkills = catchAsync(async (req, res, next) => {
    const { name } = req.query;
    let result = [];
    if (name) {
        if (!skills[name]) {
            return next(new AppError('Ngành nghề này không tồn tại trong hệ thống', 400));
        }
        result = [...skills.common, ...skills[name]];
    } else {
        result = Object.values(skills).flat();
    }
    sendResponseToClient(res, 200, {
        status: 'success',
        data: result || [],
    });
});

exports.getLocation = catchAsync(async (req, res, next) => {
    const location = await axios.get('https://provinces.open-api.vn/api/?depth=2');
    sendResponseToClient(res, 200, {
        status: 'success',
        data: location.data,
    });
});

exports.getDistrict = catchAsync(async (req, res, next) => {
    const { code } = req.query;
    const district = await axios.get(`https://provinces.open-api.vn/api/d/${code ? code : ''}`);

    sendResponseToClient(res, 200, {
        status: 'success',
        data: district.data,
    });
});

exports.getAllCity = catchAsync(async (req, res, next) => {
    const { code } = req.query;
    const district = await axios.get(`https://provinces.open-api.vn/api/p/${code ? code : ''}`);

    sendResponseToClient(res, 200, {
        status: 'success',
        data: district.data,
    });
});

exports.getCity = catchAsync(async (req, res, next) => {
    const { code } = req.params;
    const district = await axios.get(`https://provinces.open-api.vn/api/p/${code ? code : ''}?depth=2`);

    sendResponseToClient(res, 200, {
        status: 'success',
        data: district.data,
    });
});
