const Exam = require("../models/exam.model");

/* ===================== START EXAM ===================== */
exports.startExam = (req, res) => {
    const { email, total_questions } = req.body;

    Exam.getApplicationByEmail(email, (err, app) => {
        if (err) return res.status(500).json({ message: "DB error" });
        if (!app) {
            return res.status(403).json({ message: "Not applied for exam" });
        }

        Exam.getUserByEmail(email, (err, user) => {
            if (err) return res.status(500).json({ message: "DB error" });
            if (!user) {
                return res.status(403).json({ message: "User not found" });
            }

            Exam.hasAlreadyAttended(user.id, (err, attended) => {
                if (err) return res.status(500).json({ message: "DB error" });

                if (attended) {
                    return res.status(403).json({
                        message: "You have already attended this exam"
                    });
                }

                Exam.startExam(
                    {
                        user_id: user.id,
                        email: app.user_email,
                        full_name: app.full_name,
                        nqt_id: app.nqt_id,
                        role: "student",
                        total_questions
                    },
                    (err, result) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({
                                message: "Unable to start exam"
                            });
                        }

                        res.json({
                            exam_attempt_id: result.insertId,
                            full_name: app.full_name,
                            email: app.user_email
                        });
                    }
                );
            });
        });
    });
};

/* ===================== VIOLATION ===================== */
exports.saveViolation = (req, res) => {
    const { exam_attempt_id, violation_type } = req.body;

    Exam.saveViolation(exam_attempt_id, violation_type, () => {
        res.json({ message: "Violation saved" });
    });
};

/* ===================== FINISH ===================== */
exports.finishExam = (req, res) => {
    const { exam_attempt_id, attempted, correct, score } = req.body;

    Exam.finishExam(
        exam_attempt_id,
        attempted,
        correct,
        score,
        () => res.json({ message: "Exam finished" })
    );
};

/* ===================== TERMINATE ===================== */
exports.terminateExam = (req, res) => {
    const { exam_attempt_id } = req.body;

    Exam.terminateExam(exam_attempt_id, () =>
        res.json({ message: "Exam terminated" })
    );
};

exports.getDashboardProfile = (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: "Email required" });
    }

    const Exam = require("../models/exam.model");

    Exam.getLatestResultByEmail(email, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "DB error" });
        }

        res.json({
            score: result ? result.score : null,
            total: result ? result.total_questions : null
        });
    });
};

