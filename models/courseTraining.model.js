const db = require("../config/db");

exports.saveVideo = (data, cb) => {
    db.query(
        "INSERT INTO course_videos (title, video_url, course_name) VALUES (?, ?, ?)",
        data,
        cb
    );
};

exports.getVideosByCourse = (course_name, cb) => {
    db.query(
        "SELECT * FROM course_videos WHERE course_name = ?",
        [course_name],
        cb
    );
};