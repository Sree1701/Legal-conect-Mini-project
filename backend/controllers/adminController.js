const User = require("../models/User");
const LoginLog = require("../models/LoginLog");
const Complaint = require("../models/Complaint");

// ===================================
// GET ADMIN DASHBOARD STATS OVERVIEW
// ===================================
exports.getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalClients = await User.countDocuments({ role: "client" });
        const totalAdvocates = await User.countDocuments({ role: "advocate" });
        const pendingAdvocates = await User.countDocuments({ role: "advocate", advocateStatus: "Pending Verification" });
        const totalCases = await Complaint.countDocuments();
        const totalLogins = await LoginLog.countDocuments();

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalClients,
                totalAdvocates,
                pendingAdvocates,
                totalCases,
                totalLogins,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================================
// GET ALL CLIENT USERS
// ===================================
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "client" }).select("-password").sort({ createdAt: -1 }).lean();
        const formattedUsers = users.map((u) => ({
            ...u,
            id: u._id,
            name: u.fullName,
        }));

        res.status(200).json({
            success: true,
            count: formattedUsers.length,
            data: formattedUsers,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================================
// GET ALL ADVOCATES WITH CALCULATED EXP
// ===================================
exports.getAdvocates = async (req, res) => {
    try {
        const advocates = await User.find({ role: "advocate" }).select("-password").sort({ createdAt: -1 }).lean();
        const currentYear = new Date().getFullYear();

        const formattedAdvocates = advocates.map((adv) => {
            const exp = adv.enrollmentYear ? Math.max(0, currentYear - adv.enrollmentYear) : 0;
            return {
                ...adv,
                id: adv._id,
                name: adv.fullName,
                experience: exp,
                advocateStatus: adv.advocateStatus || "Pending Verification",
            };
        });

        res.status(200).json({
            success: true,
            count: formattedAdvocates.length,
            data: formattedAdvocates,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================================
// UPDATE ADVOCATE STATUS (Approve/Reject/Suspend)
// ===================================
exports.updateAdvocateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // "Approved" | "Rejected" | "Suspended" | "Pending Verification"

        const validStatuses = ["Approved", "Rejected", "Suspended", "Pending Verification"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status option provided.",
            });
        }

        const advocate = await User.findById(id);
        if (!advocate) {
            return res.status(404).json({
                success: false,
                message: "Advocate not found.",
            });
        }

        advocate.advocateStatus = status;
        await advocate.save();

        res.status(200).json({
            success: true,
            message: `Advocate ${advocate.fullName} status updated to '${status}'.`,
            data: {
                id: advocate._id,
                fullName: advocate.fullName,
                advocateStatus: advocate.advocateStatus,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================================
// DELETE USER OR ADVOCATE
// ===================================
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (user.role === "admin") {
            return res.status(400).json({ success: false, message: "Cannot delete Administrator accounts." });
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: `User ${user.fullName} (${user.role}) has been removed.`,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================================
// GET LOGIN AUDIT LOGS
// ===================================
exports.getLoginLogs = async (req, res) => {
    try {
        const logs = await LoginLog.find()
            .populate("user", "fullName email role")
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
