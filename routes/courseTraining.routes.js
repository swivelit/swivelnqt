const express = require("express");
const router = express.Router();
const controller = require("../controllers/courseTraining.controller");

router.get("/videos", controller.getVideosByCourse); // ✅ correct
router.post("/upload", controller.uploadVideo);      // ✅ correct

module.exports = router;