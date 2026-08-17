const express = require("express");
const router = express.Router();
const { processPayment, getClientPayments } = require("../controllers/paymentController");

// Process Payment
router.post("/process", processPayment);

// Get Client Payments
router.get("/client/:clientId", getClientPayments);

module.exports = router;
