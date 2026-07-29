const User = require("../models/User");
const LoginLog = require("../models/LoginLog");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/mailer");

// Helper to calculate experience from enrollment year
const calculateExperience = (enrollmentYear) => {
    if (!enrollmentYear) return 0;
    const currentYear = new Date().getFullYear();
    const exp = currentYear - parseInt(enrollmentYear, 10);
    return exp > 0 ? exp : 0;
};

// ==========================
// SEED DEFAULT ADMIN ACCOUNT
// ==========================
exports.seedDefaultAdmin = async () => {
    try {
        // Automatically drop legacy stale MongoDB indexes (such as username_1)
        try {
            const indexes = await User.collection.indexes();
            for (const index of indexes) {
                if (index.name !== "_id_" && index.name !== "email_1") {
                    await User.collection.dropIndex(index.name);
                }
            }
            await User.syncIndexes();
        } catch (idxErr) {
            // Ignore if collection not yet initialized
        }

        const adminEmail = "admin@gmail.com";
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            const defaultAdmin = new User({
                fullName: "System Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                isVerified: true,
                advocateStatus: "Approved",
            });

            await defaultAdmin.save();
            console.log("\n=======================================================");
            console.log(" [LegalConnect] Default Admin Account Created!");
            console.log(" Email    : admin@gmail.com");
            console.log(" Password : admin123");
            console.log("=======================================================\n");
        } else {
            console.log("[LegalConnect] Default admin account (admin@gmail.com) verified.");
        }
    } catch (error) {
        console.error("[LegalConnect Error] Failed to seed default admin:", error.message);
    }
};

// ==========================
// REGISTER USER
// ==========================
exports.register = async (req, res) => {
    try {
        const {
            name,
            fullName,
            email,
            password,
            phone,
            role,
            barCouncilId,
            enrollmentYear,
        } = req.body;

        const userName = (fullName || name || "").trim();

        if (!userName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields (Full Name, Email, Password).",
            });
        }

        let userRole = (role || "client").toString().toLowerCase().trim();
        if (userRole === "citizen" || userRole === "user") {
            userRole = "client";
        }

        const cleanEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: cleanEmail });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "An account with this email address already exists.",
            });
        }

        // Advocate registration validation
        if (userRole === "advocate") {
            if (!barCouncilId || !enrollmentYear) {
                return res.status(400).json({
                    success: false,
                    message: "Bar Council ID and Year of Enrollment are required for advocate registration.",
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName: userName,
            email: cleanEmail,
            password: hashedPassword,
            phone: phone || "",
            role: userRole,
            barCouncilId: userRole === "advocate" ? barCouncilId : "",
            enrollmentYear: userRole === "advocate" ? parseInt(enrollmentYear, 10) : null,
            advocateStatus: userRole === "advocate" ? "Pending Verification" : "Approved",
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: userRole === "advocate"
                ? "Advocate account registered successfully! Status is set to Pending Verification."
                : "Account created successfully! Please login to proceed.",
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error during registration: " + error.message,
        });
    }
};

// ==========================
// LOGIN USER (Initiates OTP)
// ==========================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password.",
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            await LoginLog.create({
                email: cleanEmail,
                role: "unknown",
                status: "Failed Password",
                ipAddress: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
            });

            return res.status(404).json({
                success: false,
                message: "User not found with this email address.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            await LoginLog.create({
                user: user._id,
                email: user.email,
                role: user.role,
                status: "Failed Password",
                ipAddress: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
            });

            return res.status(401).json({
                success: false,
                message: "Invalid Password",
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 Minutes Expiry
        await user.save();

        // Send OTP email using Nodemailer
        const mailResult = await sendOTPEmail(user.email, otp);

        // Record in Login History
        await LoginLog.create({
            user: user._id,
            email: user.email,
            role: user.role,
            status: "OTP Sent",
            ipAddress: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
        });

        console.log("\n==============================================");
        console.log(" [LegalConnect Authentication]");
        console.log(" User Email    :", user.email);
        console.log(" Role          :", user.role);
        console.log(" Generated OTP :", otp);
        console.log(" Email Status  :", mailResult.success ? "Sent via Nodemailer" : "Email Failed (Use Console OTP)");
        console.log(" Valid For     : 10 Minutes");
        console.log("==============================================\n");

        res.status(200).json({
            success: true,
            message: "OTP Code sent to your registered email address.",
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error: " + error.message,
        });
    }
};

// ==========================
// VERIFY OTP
// ==========================
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP code are required.",
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found",
            });
        }

        if (!user.otp || user.otp !== otp.toString().trim()) {
            await LoginLog.create({
                user: user._id,
                email: user.email,
                role: user.role,
                status: "Invalid OTP",
                ipAddress: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
            });

            return res.status(400).json({
                success: false,
                message: "Invalid OTP Code. Please check and try again.",
            });
        }

        if (user.otpExpiry && user.otpExpiry < Date.now()) {
            await LoginLog.create({
                user: user._id,
                email: user.email,
                role: user.role,
                status: "OTP Expired",
                ipAddress: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
            });

            return res.status(400).json({
                success: false,
                message: "OTP Code has expired. Please request a new code.",
            });
        }

        // Mark verified and clear OTP
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        // Record successful login in audit log
        await LoginLog.create({
            user: user._id,
            email: user.email,
            role: user.role,
            status: "Login Success",
            ipAddress: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
        });

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET || "LegalConnectSecret123",
            {
                expiresIn: "1d",
            }
        );

        const expYears = calculateExperience(user.enrollmentYear);

        const userData = {
            id: user._id,
            _id: user._id,
            fullName: user.fullName,
            name: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            barCouncilId: user.barCouncilId || "",
            enrollmentYear: user.enrollmentYear || null,
            experience: expYears,
            advocateStatus: user.advocateStatus || (user.role === "advocate" ? "Pending Verification" : "Approved"),
        };

        res.status(200).json({
            success: true,
            message: "OTP Verified Successfully! Welcome to LegalConnect.",
            token,
            user: userData,
            role: user.role,
        });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error during OTP verification: " + error.message,
        });
    }
};

// ==========================
// RESEND OTP
// ==========================
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendOTPEmail(user.email, otp);

        console.log(`[LegalConnect] Resent OTP ${otp} to ${user.email}`);

        res.status(200).json({
            success: true,
            message: "New OTP sent to your email address.",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};