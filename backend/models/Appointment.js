const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    advocate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Advocate"
    },
    appointmentDate: Date,
    slot: String,
    status: {
        type: String,
        default: "Pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);