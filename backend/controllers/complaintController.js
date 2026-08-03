const mongoose = require("mongoose");
const Complaint = require("../models/Complaint");

// Create Complaint / Case
exports.createComplaint = async (req, res) => {
    try {
        const { user, advocate, title, description, category, documents } = req.body;

        const complaint = await Complaint.create({
            user: user || req.user?.id,
            advocate: advocate || null,
            title,
            description,
            category: category || "Other",
            documents: documents || [],
            status: advocate ? "Assigned" : "Pending"
        });

        const populated = await Complaint.findById(complaint._id)
            .populate("user", "fullName email phone")
            .populate("advocate", "fullName email phone barCouncilId enrollmentYear advocateStatus");

        res.status(201).json({
            success: true,
            message: "Case registered successfully",
            data: populated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Complaints / Cases
exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate("user", "fullName email phone")
            .populate("advocate", "fullName email phone barCouncilId enrollmentYear advocateStatus")
            .sort({ createdAt: -1 });

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

// Get Complaints by Client ID
exports.getComplaintsByClient = async (req, res) => {
    try {
        const { clientId } = req.params;
        const query = mongoose.Types.ObjectId.isValid(clientId)
            ? { $or: [{ user: clientId }, { user: new mongoose.Types.ObjectId(clientId) }] }
            : { user: clientId };

        const complaints = await Complaint.find(query)
            .populate("advocate", "fullName email phone barCouncilId enrollmentYear advocateStatus")
            .sort({ createdAt: -1 });

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

// Get Complaints by Advocate ID
exports.getComplaintsByAdvocate = async (req, res) => {
    try {
        const { advocateId } = req.params;
        if (!advocateId || advocateId === "undefined" || advocateId === "null") {
            return res.status(400).json({
                success: false,
                message: "Valid Advocate ID is required"
            });
        }

        const query = mongoose.Types.ObjectId.isValid(advocateId)
            ? { $or: [{ advocate: advocateId }, { advocate: new mongoose.Types.ObjectId(advocateId) }] }
            : { advocate: advocateId };

        const complaints = await Complaint.find(query)
            .populate("user", "fullName email phone name")
            .populate("advocate", "fullName email phone barCouncilId enrollmentYear advocateStatus")
            .sort({ createdAt: -1 });

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
            .populate("user", "fullName email phone")
            .populate("advocate", "fullName email phone barCouncilId enrollmentYear advocateStatus");

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Case not found"
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

// Upload Document to Case
exports.uploadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, url, size } = req.body;

        const complaint = await Complaint.findById(id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Case not found"
            });
        }

        complaint.documents.push({
            name,
            url,
            size: size || "N/A",
            uploadedAt: new Date()
        });

        await complaint.save();

        res.status(200).json({
            success: true,
            message: "Document uploaded successfully",
            data: complaint
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Complaint Status / Advocate Assignment
exports.updateComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
            .populate("user", "fullName email phone")
            .populate("advocate", "fullName email phone barCouncilId enrollmentYear advocateStatus");

        res.status(200).json({
            success: true,
            message: "Case updated successfully",
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
            message: "Case deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};