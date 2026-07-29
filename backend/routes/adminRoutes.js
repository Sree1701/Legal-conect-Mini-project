const express = require("express");
const router = express.Router();
const {
    getAdminStats,
    getUsers,
    getAdvocates,
    updateAdvocateStatus,
    deleteUser,
    getLoginLogs,
} = require("../controllers/adminController");

const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// Admin routes
router.get("/stats", authMiddleware, adminMiddleware, getAdminStats);
router.get("/users", authMiddleware, adminMiddleware, getUsers);
router.get("/advocates", authMiddleware, adminMiddleware, getAdvocates);
router.patch("/advocates/:id/status", authMiddleware, adminMiddleware, updateAdvocateStatus);
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);
router.get("/logs", authMiddleware, adminMiddleware, getLoginLogs);

module.exports = router;
