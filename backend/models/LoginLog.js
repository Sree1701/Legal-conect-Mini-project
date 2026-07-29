const mongoose = require("mongoose");

const loginLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        email: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: "client",
        },
        status: {
            type: String,
            enum: ["OTP Sent", "Login Success", "Failed Password", "Invalid OTP", "OTP Expired"],
            required: true,
        },
        ipAddress: {
            type: String,
            default: "Unknown",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("LoginLog", loginLogSchema);
