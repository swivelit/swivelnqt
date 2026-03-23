const path = require("path");
const Training = require("../models/training.model");

exports.getVideos = (req, res) => {
    Training.getAllVideos((err, results) => {
        if (err) return res.status(500).json({ message: "DB Error" });
        res.json(results);
    });
};

exports.uploadVideo = (req, res) => {
    const title = req.body?.title;
    const role = req.body?.role;


    console.log("UPLOAD DATA:", title, role);


    if (!title || !role) {
        return res.status(400).json({ message: "Missing data" });
    }


    if (role !== "trainer" && role !== "admin") {
        return res.status(403).json({ message: "Permission denied" });
    }


    if (!req.files || !req.files.video) {
        return res.status(400).json({ message: "Video required" });
    }


    const video = req.files.video;


    // ✅ Correct path using project root
    const uploadDir = path.join(process.cwd(), "assets/videos");


    // Make sure folder exists
    const fs = require("fs");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }


    const uploadPath = path.join(uploadDir, Date.now() + "_" + video.name);


    video.mv(uploadPath, err => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Upload failed" });
        }


        // Save relative path to DB
        const dbPath = "assets/videos/" + path.basename(uploadPath);


        Training.saveVideo(title, dbPath, () => {
            res.json({ message: "Video uploaded successfully" });
        });
    });
};