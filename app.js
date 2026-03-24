require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const fileUpload = require("express-fileupload");

const app = express();

const uploadRoot = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "uploads");

fs.mkdirSync(uploadRoot, { recursive: true });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 1024 * 1024 * 500
    }
  })
);

// Static files
app.use(express.static(__dirname));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/uploads", express.static(uploadRoot));

// Health route
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// API routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/application", require("./routes/application.routes"));
app.use("/api/exam", require("./routes/exam.routes"));
app.use("/api/training", require("./routes/training.routes"));
app.use("/api/course", require("./routes/course.routes"));
app.use("/api/enquiry", require("./routes/enquiry.routes"));
app.use("/api/course-training", require("./routes/courseTraining.routes"));

// Pages
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/dashboard", (_req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads directory: ${uploadRoot}`);
});