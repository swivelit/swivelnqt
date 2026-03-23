const bcrypt = require("bcrypt");
const User = require("../models/user.model");

/* ================= SIGNUP ================= */

exports.signup = async (req, res) => {

    const { fullName, dob, email, mobile, password } = req.body;

    try {

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = "student";

        User.createUser(
            [fullName, email, dob, mobile, hashedPassword, role],
            (err) => {

                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "User already exists" });
                }

                res.json({ message: "Signup successful" });

            }
        );

    } catch (error) {

        console.log(error);
        res.status(500).json({ message: "Signup failed" });

    }
};


/* ================= LOGIN ================= */

exports.login = (req, res) => {

    const { email, password } = req.body;

    console.log(email, password);

    User.findUserByEmail(email, async (err, result) => {

        if (err || result.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = result[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({
            message: "Login successful",
            role: user.role,
            email: user.email,
            full_name: user.full_name,
            message: "Login successful",
            user_id: user.id
        });

    });
};


/* ================= LOGOUT ================= */

exports.logout = (req, res) => {

    res.json({ message: "Logged out successfully" });

};