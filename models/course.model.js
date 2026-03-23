const db = require("../config/db");

/* GET ALL COURSES */
exports.getAllCourses = (cb) => {
    db.query("SELECT * FROM courses ORDER BY id DESC", cb);
};

/* GET SINGLE COURSE */
exports.getCourseById = (id, cb) => {
    db.query("SELECT * FROM courses WHERE id = ?", [id], cb);
};

/* ADD COURSE */
exports.addCourse = (data, cb) => {

    const sql = `
    INSERT INTO courses
    (course_name, description, duration, fee, trainer_name, trainer_email, gmeet_link, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, data, cb);
};

/* UPDATE COURSE */
exports.updateCourse = (id, data, cb) => {

    const sql = `
    UPDATE courses
    SET course_name=?, description=?, duration=?, fee=?, trainer_name=?, trainer_email=?, gmeet_link=?, status=?
    WHERE id=?
    `;

    db.query(sql, [...data, id], cb);
};

/* DELETE COURSE */
exports.deleteCourse = (id, cb) => {
    db.query("DELETE FROM courses WHERE id=?", [id], cb);
};