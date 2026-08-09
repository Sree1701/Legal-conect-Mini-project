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
            "Under Review",
            "In Progress",
            "Hearing Scheduled in Court",
            "Case Resolved",
            "Case Closed",
            "Hearing Scheduled",
            "Resolved",
            "Closed"
        ],
        default: "Pending"
    },

    // CASE-BOUND HEARING & CONSULTATION SLOT FIELDS
    hearingDate: {
        type: String,
        default: ""
    },

    hearingTime: {
        type: String,
        default: ""
    },

    duration: {
        type: Number,
        default: 30
    },

    consultationFee: {
        type: Number,
        default: null
    },

    meetingLink: {
        type: String,
        default: ""
    },

    advocateNotes: {
        type: String,
        default: ""
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("Complaint", complaintSchema);