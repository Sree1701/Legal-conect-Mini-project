const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true
    },

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
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);