const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    advocate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
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

    documents: [
        {
            name: String,
            url: String,
            size: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    status: {
        type: String,
        enum: [
            "Pending",
            "Assigned",
            "In Progress",
            "Hearing Scheduled",
            "Under Review",
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