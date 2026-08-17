const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
{
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    advocate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        default: null,
    },

    complaint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint",
        default: null,
    },

    amount: {
        type: Number,
        required: true,
    },

    cardHolderName: {
        type: String,
        default: "",
    },

    cardNumberLast4: {
        type: String,
        default: "",
    },

    paymentMethod: {
        type: String,
        default: "Card",
    },

    status: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Completed",
    },

    transactionId: {
        type: String,
        required: true,
    },
},
{
    timestamps: true,
}
);

module.exports = mongoose.model("Payment", paymentSchema);
