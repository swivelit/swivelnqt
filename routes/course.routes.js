const express = require("express");
const router = express.Router();
const controller = require("../controllers/course.controller");

router.get("/", controller.getCourses);
router.get("/:id", controller.getCourseById);
router.post("/add", controller.addCourse);
router.put("/update/:id", controller.updateCourse);
router.delete("/delete/:id", controller.deleteCourse);

module.exports = router;