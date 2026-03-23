const path = require("path");
const fs = require("fs");
const Training = require("../models/courseTraining.model");

/* ===================== UPLOAD VIDEO ===================== */
exports.uploadVideo = (req, res) => {

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { title, course_name, role } = req.body;

    // ✅ Validation
    if (!title || !course_name || !role) {
        return res.status(400).json({ message: "Missing data" });
    }

    // ✅ Only trainer / admin allowed
    if (role !== "trainer" && role !== "admin") {
        return res.status(403).json({ message: "Permission denied" });
    }

    // ✅ Check file
    if (!req.files || !req.files.video) {
        return res.status(400).json({ message: "Video file required" });
    }

    const video = req.files.video;

    // ✅ Upload folder
    const uploadDir = path.join(process.cwd(), "assets/videos/training_videos");

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = Date.now() + "_" + video.name;
    const uploadPath = path.join(uploadDir, fileName);

    // ✅ Move file
    video.mv(uploadPath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Upload failed" });
        }

        const video_url = "assets/videos/training_videos/" + fileName;

        // ✅ Save in DB
        Training.saveVideo([title, video_url, course_name], (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "DB insert failed" });
            }

            res.json({ message: "Video uploaded successfully" });
        });
    });
};


/* ===================== GET VIDEOS BY COURSE ===================== */
exports.getVideosByCourse = (req, res) => {

    const { course_name } = req.query;

    if (!course_name) {
        return res.status(400).json({ message: "Course name required" });
    }

    Training.getVideosByCourse(course_name, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "DB error" });
        }

        res.json(results);
    });
};