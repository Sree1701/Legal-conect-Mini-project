const express = require("express");

const router = express.Router();

const {
    bookAppointment,
    getClientAppointments,
    getAdvocateAppointments,
    assignSlot,
    rejectAppointment,
    completeAppointment
} = require("../controllers/appointmentController");


// ============================================
// CLIENT BOOKS APPOINTMENT
// POST /api/appointments/book
// ============================================

router.post("/book", bookAppointment);


// ============================================
// CLIENT VIEW APPOINTMENTS
// GET /api/appointments/client/:clientId
// ============================================

router.get("/client/:clientId", getClientAppointments);


// ============================================
// ADVOCATE VIEW APPOINTMENTS
// GET /api/appointments/advocate/:advocateId
// ============================================

router.get("/advocate/:advocateId", getAdvocateAppointments);


// ============================================
// ADVOCATE ASSIGNS SLOT
// PUT /api/appointments/assign-slot/:id
// ============================================

router.put("/assign-slot/:id", assignSlot);


// ============================================
// ADVOCATE REJECTS APPOINTMENT
// PUT /api/appointments/reject/:id
// ============================================

router.put("/reject/:id", rejectAppointment);


// ============================================
// COMPLETE APPOINTMENT
// PUT /api/appointments/complete/:id
// ============================================

router.put("/complete/:id", completeAppointment);


module.exports = router;