const authRoute = require('./authRoute');
const companyRoute = require('./companyRoute');
const jobSeekerRoute = require('./jobSeekerRoute');
const jobRoute = require('./jobRoute');
const userRoute = require('./userRoute');

const route = (app) => {
    app.use('/auth', authRoute);
    app.use('/company', companyRoute);
    app.use('/jobseeker', jobSeekerRoute);
    app.use('/job', jobRoute);
    app.use('/user', userRoute);
};

module.exports = route;
