const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
    },

    email: {
        type: String,
        required: [true, "Email address is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },

    password: {
        type: String,
        required: [true, "Password is required"],
    },

    phone: {
        type: String,
        default: "",
    },

    role: {
        type: String,
        enum: ["client", "citizen", "user", "advocate", "admin"],
        default: "client",
    },

    otp: {
        type: String,
        default: null,
    },

    otpExpiry: {
        type: Date,
        default: null,
    },

    isVerified: {
        type: Boolean,
        default: false,
    },

    barCouncilId: {
        type: String,
        default: "",
    },

    enrollmentYear: {
        type: Number,
        default: null,
    },

    advocateStatus: {
        type: String,
        enum: ["Pending Verification", "Approved", "Rejected", "Suspended"],
        default: "Pending Verification",
    }
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);

// Virtual getter for 'name' to ensure frontend backwards compatibility
userSchema.virtual("name").get(function () {
    return this.fullName;
});

// Pre-validate hook to automatically supply fullName and normalize role
userSchema.pre("validate", function () {
    if (!this.fullName && this.name) {
        this.fullName = this.name;
    }
    if (this.role === "citizen" || this.role === "user") {
        this.role = "client";
    }
});

module.exports = mongoose.model("User", userSchema);