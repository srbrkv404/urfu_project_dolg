const jobService = require("../services/job.service");

const createJob = async (req, res, next) => {
  try {
    const result = await jobService.createJob(req.user.id, req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

const getMyJobs = async (req, res, next) => {
  try {
    const result = await jobService.getMyJobs(req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const getJobApplications = async (req, res, next) => {
  try {
    const result = await jobService.getJobApplications(req.user.id, req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createJob,
  getMyJobs,
  getJobApplications,
};
