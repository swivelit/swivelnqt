const path = require("path");
const fs = require("fs");
const Training = require("../models/courseTraining.model");

function safeFileName(fileName) {
  return `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
}

exports.uploadVideo = (req, res) => {
  const { title, course_name, role } = req.body;

  if (!title || !course_name || !role) {
    return res.status(400).json({ message: "Missing data" });
  }

  if (role !== "trainer" && role !== "admin") {
    return res.status(403).json({ message: "Permission denied" });
  }

  if (!req.files || !req.files.video) {
    return res.status(400).json({ message: "Video file required" });
  }

  const video = req.files.video;
  const uploadDir = path.join(
    process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(process.cwd(), "uploads"),
    "course-training"
  );

  fs.mkdirSync(uploadDir, { recursive: true });

  const fileName = safeFileName(video.name);
  const uploadPath = path.join(uploadDir, fileName);

  video.mv(uploadPath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Upload failed" });
    }

    const video_url = `/uploads/course-training/${fileName}`;

    Training.saveVideo([title, video_url, course_name], (saveErr) => {
      if (saveErr) {
        console.error(saveErr);
        return res.status(500).json({ message: "DB insert failed" });
      }

      res.json({ message: "Video uploaded successfully" });
    });
  });
};

exports.getVideosByCourse = (req, res) => {
  const { course_name } = req.query;

  if (!course_name) {
    return res.status(400).json({ message: "Course name required" });
  }

  Training.getVideosByCourse(course_name, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error" });
    }

    res.json(results);
  });
};