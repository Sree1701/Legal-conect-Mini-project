const mongoose = require("mongoose");

const advocateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    barCouncilId: {
        type: String,
        required: true
    },
    specialization: String,
    experience: Number,
    consultationFee: Number,
    availability: String,
    verified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Advocate", advocateSchema);