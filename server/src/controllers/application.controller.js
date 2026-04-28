const applicationService = require("../services/application.service");

const createApplication = async (req, res, next) => {
  try {
    const result = await applicationService.createApplication(req.user.id, req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const result = await applicationService.updateApplicationStatus(
      req.user.id,
      req.params.id,
      req.body,
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const getApplicationHistory = async (req, res, next) => {
  try {
    const result = await applicationService.getApplicationHistory(req.user.id, req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createApplication,
  updateApplicationStatus,
  getApplicationHistory,
};
