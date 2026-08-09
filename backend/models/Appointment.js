const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
{
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    advocate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    issue: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        default: "",
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "Approved",
            "Rejected",
            "Completed",
            "Cancelled",
        ],
        default: "Pending",
    },

    appointmentDate: {
        type: Date,
        default: null,
    },

    appointmentTime: {
        type: String,
        default: "",
    },

    duration: {
        type: Number,
        default: 30,
    },

    consultationFee: {
        type: Number,
        default: null,
    },

    meetingLink: {
        type: String,
        default: "",
    },

    advocateNotes: {
        type: String,
        default: "",
    },

    paymentStatus: {
        type: String,
        enum: [
            "Pending",
            "Paid",
        ],
        default: "Pending",
    },

},
{
    timestamps: true,
}
);

module.exports = mongoose.model("Appointment", appointmentSchema);