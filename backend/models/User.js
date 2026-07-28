const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    phone: {
        type: String
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["client", "advocate", "admin"],
        default: "client"
    },

    specialization: {
        type: String,
        default: "General Practice"
    },

    experience: {
        type: String,
        default: "5+ Years"
    },

    bio: {
        type: String,
        default: "Legal Professional registered on LegalConnect."
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);