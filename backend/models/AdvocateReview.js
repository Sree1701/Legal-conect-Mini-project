const mongoose = require("mongoose");

const advocateReviewSchema = new mongoose.Schema(
{
    advocate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },

    review: {
        type: String
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("AdvocateReview", advocateReviewSchema);