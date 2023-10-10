const authRoute = require('./authRoute');
const companyRoute = require('./companyRoute');
const jobSeekerRoute = require('./jobSeekerRoute');
const categoryJobRoute = require('./categoryJobRoute');
const jobRoute = require('./jobRoute');
const userRoute = require('./userRoute');
const utilsRoute = require('./utilsRoute');

const route = (app) => {
    app.use('/auth', authRoute);
    app.use('/company', companyRoute);
    app.use('/jobseeker', jobSeekerRoute);
    app.use('/categoryJob', categoryJobRoute);
    app.use('/job', jobRoute);
    app.use('/user', userRoute);
    app.use('/utils', utilsRoute);
};

module.exports = route;
