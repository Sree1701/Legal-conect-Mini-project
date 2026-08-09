const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");

// ===================================================
// CLIENT BOOKS AN APPOINTMENT
// ===================================================

exports.bookAppointment = async (req, res) => {

    try {

        const {

            client,
            advocate,
            issue,
            description,
            consultationFee

        } = req.body;

        const User = require("../models/User");
        const advocateUser = await User.findById(advocate);
        const feeToSet = (consultationFee !== undefined && consultationFee !== null && consultationFee !== "")
            ? Number(consultationFee)
            : (advocateUser?.consultationFee ?? null);

        const appointment = new Appointment({

            client,
            advocate,
            issue,
            description,
            consultationFee: feeToSet

        });

        await appointment.save();

        res.status(201).json({

            success: true,
            message: "Appointment Request Sent Successfully",

            appointment

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

};


// ===================================================
// GET CLIENT APPOINTMENTS
// ===================================================

exports.getClientAppointments = async (req, res) => {

    try {

        const { clientId } = req.params;
        const query = mongoose.Types.ObjectId.isValid(clientId)
            ? { $or: [{ client: clientId }, { client: new mongoose.Types.ObjectId(clientId) }] }
            : { client: clientId };

        const appointments = await Appointment.find(query)

        .populate("advocate", "fullName email phone name")

        .sort({

            createdAt: -1

        });

        res.json({

            success: true,

            appointments

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

};


// ===================================================
// GET ADVOCATE APPOINTMENTS
// ===================================================

exports.getAdvocateAppointments = async (req, res) => {

    try {

        const { advocateId } = req.params;
        if (!advocateId || advocateId === "undefined" || advocateId === "null") {
            return res.status(400).json({ success: false, message: "Valid Advocate ID is required" });
        }

        const query = mongoose.Types.ObjectId.isValid(advocateId)
            ? { $or: [{ advocate: advocateId }, { advocate: new mongoose.Types.ObjectId(advocateId) }] }
            : { advocate: advocateId };

        const appointments = await Appointment.find(query)

        .populate("client", "fullName email phone name")

        .sort({

            createdAt: -1

        });

        res.json({

            success: true,

            appointments

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

};


// ===================================================
// APPROVE & ALLOCATE SLOT
// ===================================================

exports.assignSlot = async (req, res) => {

    try {

        const {

            appointmentDate,
            appointmentTime,
            duration,
            consultationFee,
            meetingLink,
            advocateNotes

        } = req.body;

        const appointment = await Appointment.findById(

            req.params.id

        );

        if (!appointment) {

            return res.status(404).json({

                success: false,

                message: "Appointment Not Found"

            });

        }

        appointment.status = "Approved";

        appointment.appointmentDate = appointmentDate;

        appointment.appointmentTime = appointmentTime;

        appointment.duration = duration;

        appointment.consultationFee = consultationFee;

        if (meetingLink !== undefined) appointment.meetingLink = meetingLink;

        appointment.advocateNotes = advocateNotes;

        await appointment.save();

        res.json({

            success: true,

            message: "Appointment Approved",

            appointment

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

};


// ===================================================
// REJECT APPOINTMENT
// ===================================================

exports.rejectAppointment = async (req, res) => {

    try {

        const appointment = await Appointment.findById(

            req.params.id

        );

        if (!appointment) {

            return res.status(404).json({

                success: false,

                message: "Appointment Not Found"

            });

        }

        appointment.status = "Rejected";

        await appointment.save();

        res.json({

            success: true,

            message: "Appointment Rejected"

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

};


// ===================================================
// COMPLETE APPOINTMENT
// ===================================================

exports.completeAppointment = async (req, res) => {

    try {

        const appointment = await Appointment.findById(

            req.params.id

        );

        if (!appointment) {

            return res.status(404).json({

                success: false,

                message: "Appointment Not Found"

            });

        }

        appointment.status = "Completed";

        await appointment.save();

        res.json({

            success: true,

            message: "Appointment Completed"

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

};

// ===================================================
// CLIENT BOOKS A SPECIFIC ADVOCATE PREFERRED SLOT
// ===================================================
exports.bookAdvocateSlot = async (req, res) => {
    try {
        const { client, advocate, slotId, issue, description } = req.body;

        if (!client || !advocate || !issue) {
            return res.status(400).json({
                success: false,
                message: "Client ID, Advocate ID, and Issue subject are required.",
            });
        }

        const User = require("../models/User");
        const advocateUser = await User.findById(advocate);
        if (!advocateUser) {
            return res.status(404).json({
                success: false,
                message: "Advocate account not found.",
            });
        }

        let slot = null;
        if (slotId && advocateUser.availableSlots) {
            slot = advocateUser.availableSlots.find((s) => String(s.slotId) === String(slotId));
        }

        if (slot && slot.isBooked) {
            return res.status(400).json({
                success: false,
                message: "This preferred slot has already been booked by another client. Please select another slot.",
            });
        }

        const calculatedFee = slot && (slot.fee !== undefined && slot.fee !== null)
            ? slot.fee
            : (req.body.consultationFee !== undefined && req.body.consultationFee !== null && req.body.consultationFee !== ""
                ? Number(req.body.consultationFee)
                : (advocateUser.consultationFee ?? null));

        const appointment = new Appointment({
            client,
            advocate,
            issue,
            description: description || "",
            appointmentDate: slot ? slot.date : req.body.appointmentDate || null,
            appointmentTime: slot ? slot.startTime : req.body.appointmentTime || "",
            duration: slot ? slot.duration : req.body.duration || 30,
            consultationFee: calculatedFee,
            status: "Pending",
        });

        await appointment.save();

        if (slot) {
            slot.isBooked = true;
            slot.bookedBy = client;
            slot.appointmentRef = appointment._id;
            await advocateUser.save();
        }

        const populatedAppt = await Appointment.findById(appointment._id)
            .populate("client", "fullName email phone name")
            .populate("advocate", "fullName email phone name specialization");

        res.status(201).json({
            success: true,
            message: slot
                ? `Preferred slot (${slot.date} @ ${slot.startTime}) reserved & consultation request sent!`
                : "Consultation request sent successfully!",
            appointment: populatedAppt,
        });
    } catch (error) {
        console.error("bookAdvocateSlot Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error booking advocate slot: " + error.message,
        });
    }
};