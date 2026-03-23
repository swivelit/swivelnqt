const Enquiry = require("../models/enquiry.model.js");

/* ADD ENQUIRY */
exports.addEnquiry = (req, res) => {

    const { user_id, course_id, course_name } = req.body;

    if (!user_id || !course_id || !course_name) {
        return res.status(400).json({ message: "Missing data" });
    }

    Enquiry.checkExisting(user_id, course_id, (err, result) => {

        if (result.length > 0) {
            return res.json({ message: "Already applied for this course" });
        }

        Enquiry.addEnquiry(
            [user_id, course_id, course_name],
            (err) => {
                if (err) return res.status(500).json({ message: "Insert failed" });

                res.json({ message: "Enquiry submitted successfully" });
            }
        );

    });

};

/* GET USER ENQUIRY */
exports.getUserEnquiry = (req, res) => {

    const user_id = req.params.user_id;

    Enquiry.getUserEnquiry(user_id, (err, data) => {

        if (err) return res.status(500).json({ message: "DB error" });

        res.json(data);

    });

};