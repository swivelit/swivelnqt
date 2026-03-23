const Application = require("../models/application.model");

/* =========================
   SUBMIT APPLICATION
========================= */
exports.submitApplication = (req, res) => {
    const {
        email,
        fullName,
        age,
        gender,
        phone,
        whatsapp,
        college,
        qualification,
        passedOutYear,
        district,
        pincode,
        reference,
        address
    } = req.body;

    const courseName = "NQT Exam";
    const fees = 1000;

    /* =========================
       CHECK DUPLICATE EMAIL
    ========================= */
    Application.getApplicationsByEmail(email, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Application check failed" });
        }

        // If already applied
        if (results.length > 0) {
            return res.status(400).json({
                message: "You have already applied for this exam."
            });
        }

        /* =========================
           INSERT APPLICATION
        ========================= */
        Application.createApplication(
            [
                email,
                fullName,
                age,
                gender,
                phone,
                whatsapp,
                college,
                qualification,
                passedOutYear,
                district,
                pincode,
                reference,
                address,
                courseName,
                fees
            ],
            err => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Application failed" });
                }
                res.json({ message: "Application submitted successfully" });
            }
        );

    });
};

/* =========================
   GET ALL APPLICATIONS
========================= */
exports.getAllApplications = (req, res) => {
    Application.getAllApplications((err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to fetch applications" });
        }
        res.json(results);
    });
};

/* =========================
   GET BY USER EMAIL
========================= */
exports.getApplicationsByEmail = (req, res) => {
    const email = req.params.email;

    Application.getApplicationsByEmail(email, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to fetch data" });
        }
        res.json(results);
    });
};

/* =========================
   GET BY ID
========================= */
exports.getApplicationById = (req, res) => {
    const id = req.params.id;

    Application.getApplicationById(id, (err, result) => {
        if (err || result.length === 0) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.json(result[0]);
    });
};
