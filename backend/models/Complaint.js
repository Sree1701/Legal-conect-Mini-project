const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    category: {
        type: String,
        enum: [
            "Civil",
            "Criminal",
            "Family",
            "Property",
            "Consumer",
            "Cyber",
            "Other"
        ],
        default: "Other"
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "Assigned",
            "In Progress",
            "Resolved",
            "Closed"
        ],
        default: "Pending"
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("Complaint", complaintSchema);