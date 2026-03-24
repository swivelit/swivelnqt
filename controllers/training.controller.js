const path = require("path");
const fs = require("fs");
const Training = require("../models/training.model");

function safeFileName(fileName) {
  return `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
}

exports.getVideos = (req, res) => {
  Training.getAllVideos((err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB Error" });
    }

    res.json(results);
  });
};

exports.uploadVideo = (req, res) => {
  const title = req.body?.title;
  const role = req.body?.role;

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
  const uploadDir = path.join(
    process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(process.cwd(), "uploads"),
    "nqt-training"
  );

  fs.mkdirSync(uploadDir, { recursive: true });

  const fileName = safeFileName(video.name);
  const uploadPath = path.join(uploadDir, fileName);

  video.mv(uploadPath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Upload failed" });
    }

    const dbPath = `/uploads/nqt-training/${fileName}`;

    Training.saveVideo(title, dbPath, (saveErr) => {
      if (saveErr) {
        console.error(saveErr);
        return res.status(500).json({ message: "DB insert failed" });
      }

      res.json({ message: "Video uploaded successfully" });
    });
  });
};