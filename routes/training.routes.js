const express = require("express");
const router = express.Router();
const controller = require("../controllers/training.controller");

router.get("/videos", controller.getVideos);
router.post("/upload", controller.uploadVideo);

module.exports = router;