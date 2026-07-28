const Complaint = require("../models/Complaint");

// Create Complaint
exports.createComplaint = async (req, res) => {
    try {

        const complaint = await Complaint.create(req.body);

        res.status(201).json({
            success: true,
            message: "Complaint submitted successfully",
            data: complaint
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get All Complaints
exports.getAllComplaints = async (req, res) => {
    try {

        const complaints = await Complaint.find()
            .populate("user", "name email");

        res.status(200).json({
            success: true,
            count: complaints.length,
            data: complaints
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get Complaint By ID
exports.getComplaintById = async (req, res) => {
    try {

        const complaint = await Complaint.findById(req.params.id)
            .populate("user", "name email");

        if (!complaint) {

            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });

        }

        res.status(200).json({
            success: true,
            data: complaint
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Update Complaint Status
exports.updateComplaint = async (req, res) => {
    try {

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Complaint updated successfully",
            data: complaint
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Delete Complaint
exports.deleteComplaint = async (req, res) => {
    try {

        await Complaint.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Complaint deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};