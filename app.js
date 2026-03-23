const express = require("express");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// ✅ Serve static files
app.use(express.static(__dirname));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/assets/videos", express.static(path.join(__dirname, "assets/videos")));

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/application", require("./routes/application.routes"));
app.use("/api/exam", require("./routes/exam.routes"));
app.use("/api/training", require("./routes/training.routes"));
app.use("/api/course", require("./routes/course.routes"));
app.use("/api/enquiry", require("./routes/enquiry.routes"));
app.use("/api/course-training", require("./routes/courseTraining.routes"));

// Pages
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "dashboard.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});