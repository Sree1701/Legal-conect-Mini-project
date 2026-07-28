const express = require("express");
const router = express.Router();
const {
    createComplaint,
    getAllComplaints,
    getComplaintsByClient,
    getComplaintsByAdvocate,
    getComplaintById,
    uploadDocument,
    updateComplaint,
    deleteComplaint
} = require("../controllers/complaintController");

router.post("/", createComplaint);
router.get("/", getAllComplaints);
router.get("/client/:clientId", getComplaintsByClient);
router.get("/advocate/:advocateId", getComplaintsByAdvocate);
router.get("/:id", getComplaintById);
router.post("/:id/upload", uploadDocument);
router.put("/:id", updateComplaint);
router.patch("/:id/status", updateComplaint);
router.delete("/:id", deleteComplaint);

module.exports = router;
