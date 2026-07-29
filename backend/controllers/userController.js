const User = require("../models/User");

// Get All Advocates with calculated Experience
exports.getAdvocates = async (req, res) => {
    try {
        const advocates = await User.find({ role: "advocate" }).select("-password").lean();
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
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
