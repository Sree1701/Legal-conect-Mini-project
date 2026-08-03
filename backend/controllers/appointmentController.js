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
            description

        } = req.body;

        const appointment = new Appointment({

            client,
            advocate,
            issue,
            description

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

        const appointments = await Appointment.find({

            client: req.params.clientId

        })

        .populate("advocate", "fullName email phone")

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

        const appointments = await Appointment.find({

            advocate: req.params.advocateId

        })

        .populate("client", "fullName email phone")

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