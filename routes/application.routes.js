const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/application.controller");

// POST
router.post("/apply", applicationController.submitApplication);

// GET
router.get("/all", applicationController.getAllApplications);
router.get("/user/:email", applicationController.getApplicationsByEmail);
router.get("/:id", applicationController.getApplicationById);

module.exports = router;
