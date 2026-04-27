const express = require("express");
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");
const { ROLE } = require("../config/constants");

const router = express.Router();

router.get("/student-only", authenticate, authorizeRoles(ROLE.STUDENT), (_req, res) => {
  res.status(200).json({ message: "Доступно только студенту." });
});

router.get("/employer-only", authenticate, authorizeRoles(ROLE.EMPLOYER), (_req, res) => {
  res.status(200).json({ message: "Доступно только работодателю." });
});

module.exports = router;
