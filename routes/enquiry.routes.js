const express = require("express");
const router = express.Router();
const controller = require("../controllers/enquiry.controller.js");

router.post("/add", controller.addEnquiry);
router.get("/user/:user_id", controller.getUserEnquiry);

module.exports = router;