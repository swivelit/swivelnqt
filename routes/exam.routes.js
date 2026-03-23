const express = require("express");
const router = express.Router();
const examController = require("../controllers/exam.controller.js");

router.post("/start", examController.startExam);
router.post("/violation", examController.saveViolation);
router.post("/finish", examController.finishExam);
router.post("/terminate", examController.terminateExam);
router.get("/profile", examController.getDashboardProfile);

module.exports = router;
