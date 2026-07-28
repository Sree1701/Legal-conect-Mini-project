const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    advocate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Advocate"
    },
    title: String,
    description: String,
    status: String,
    nextHearingDate: Date
}, { timestamps: true });

module.exports = mongoose.model("Case", caseSchema);