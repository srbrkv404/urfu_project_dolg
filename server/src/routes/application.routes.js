const express = require("express");
const applicationController = require("../controllers/application.controller");
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");
const { ROLE } = require("../config/constants");

const router = express.Router();

router.post("/", authenticate, authorizeRoles(ROLE.STUDENT), applicationController.createApplication);
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles(ROLE.EMPLOYER),
  applicationController.updateApplicationStatus,
);
router.get("/:id/history", authenticate, applicationController.getApplicationHistory);

module.exports = router;
