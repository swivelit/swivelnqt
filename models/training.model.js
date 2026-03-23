const db = require("../config/db");

exports.getAllVideos = (callback) => {
    db.query("SELECT * FROM nqt_training_videos ORDER BY id DESC", callback);
};

exports.saveVideo = (title, video_url, callback) => {
    db.query(
        "INSERT INTO nqt_training_videos (title, video_url) VALUES (?, ?)",
        [title, video_url],
        callback
    );
};