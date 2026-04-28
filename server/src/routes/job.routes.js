const express = require("express");
const jobController = require("../controllers/job.controller");
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");
const { ROLE } = require("../config/constants");

const router = express.Router();

router.post("/", authenticate, authorizeRoles(ROLE.EMPLOYER), jobController.createJob);
router.get("/mine", authenticate, authorizeRoles(ROLE.EMPLOYER), jobController.getMyJobs);
router.get(
  "/:id/applications",
  authenticate,
  authorizeRoles(ROLE.EMPLOYER),
  jobController.getJobApplications,
);

module.exports = router;
