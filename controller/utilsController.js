const catchAsync = require('../utils/catchAsync');
const { sendResponseToClient } = require('../utils/ultils');

const { skills } = require('../constants/index');

exports.getSkills = catchAsync(async (req, res, next) => {
    sendResponseToClient(res, 200, {
        status: 'success',
        data: skills || [],
    });
});
