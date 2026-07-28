const User = require("../models/User");

// Get All Advocates
exports.getAdvocates = async (req, res) => {
    try {
        const advocates = await User.find({ role: "advocate" }).select("-password");

        res.status(200).json({
            success: true,
            count: advocates.length,
            data: advocates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
