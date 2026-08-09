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
    },

    specialization: {
        type: String,
        default: "General Legal Practice",
    },

    bio: {
        type: String,
        default: "",
    },

    officeAddress: {
        type: String,
        default: "",
    },

    consultationFee: {
        type: Number,
        default: null,
    },

    availableSlots: [
        {
            slotId: {
                type: String,
                default: function () {
                    return new mongoose.Types.ObjectId().toString();
                },
            },
            date: {
                type: String,
                required: true,
            },
            startTime: {
                type: String,
                required: true,
            },
            endTime: {
                type: String,
                required: true,
            },
            duration: {
                type: Number,
                default: 30,
            },
            fee: {
                type: Number,
                default: null,
            },
            isBooked: {
                type: Boolean,
                default: false,
            },
            bookedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },
            appointmentRef: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Appointment",
                default: null,
            },
        },
    ],

    workingHours: {
        days: {
            type: [String],
            default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        },
        startTime: {
            type: String,
            default: "09:00 AM",
        },
        endTime: {
            type: String,
            default: "05:00 PM",
        },
        slotDuration: {
            type: Number,
            default: 30,
        },
    },
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