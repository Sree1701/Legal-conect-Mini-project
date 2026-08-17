const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");
const Complaint = require("../models/Complaint");

// Process simulated payment for consultation
exports.processPayment = async (req, res) => {
    try {
        const {
            appointmentId,
            complaintId,
            cardHolderName,
            cardNumber,
            expiryDate,
            cvv,
            amount,
            clientId,
            advocateId,
        } = req.body;

        if (!clientId || !amount) {
            return res.status(400).json({
                success: false,
                message: "Client ID and consultation fee amount are required.",
            });
        }

        let appointmentRef = null;
        let complaintRef = null;

        // If payment is for an Appointment
        if (appointmentId) {
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: "Appointment record not found.",
                });
            }
            appointment.paymentStatus = "Paid";
            if (!appointment.meetingLink) {
                appointment.meetingLink = `https://meet.jit.si/LegalConnect-Consultation-${appointment._id}`;
            }
            if (appointment.status === "Pending") {
                appointment.status = "Approved";
            }
            await appointment.save();
            appointmentRef = appointment._id;
        }

        // If payment is for a Case Complaint
        if (complaintId) {
            const complaint = await Complaint.findById(complaintId);
            if (complaint) {
                complaint.paymentStatus = "Paid";
                if (!complaint.meetingLink) {
                    complaint.meetingLink = `https://meet.jit.si/LegalConnect-Case-${complaint._id}`;
                }
                await complaint.save();
                complaintRef = complaint._id;
            }
        }

        // If payment is directly for an Advocate (without prior appointment ID)
        if (!appointmentId && !complaintId && clientId && advocateId) {
            let appt = await Appointment.findOne({ client: clientId, advocate: advocateId, paymentStatus: "Pending" });
            if (!appt) {
                appt = new Appointment({
                    client: clientId,
                    advocate: advocateId,
                    issue: "Direct Advocate Legal Consultation",
                    description: "Paid consultation with advocate",
                    consultationFee: Number(amount),
                    status: "Approved",
                    paymentStatus: "Paid",
                    meetingLink: `https://meet.jit.si/LegalConnect-Consultation-${Date.now()}`
                });
            } else {
                appt.paymentStatus = "Paid";
                appt.status = "Approved";
                if (!appt.meetingLink) {
                    appt.meetingLink = `https://meet.jit.si/LegalConnect-Consultation-${appt._id}`;
                }
            }
            await appt.save();
            appointmentRef = appt._id;
        }

        const last4 = cardNumber ? cardNumber.replace(/\s+/g, "").slice(-4) : "1234";
        const transactionId = "TXN_" + Date.now() + "_" + Math.floor(Math.random() * 10000);

        const payment = new Payment({
            client: clientId,
            advocate: advocateId || null,
            appointment: appointmentRef,
            complaint: complaintRef,
            amount: Number(amount),
            cardHolderName: cardHolderName || "Valued Client",
            cardNumberLast4: last4,
            paymentMethod: "Card",
            status: "Completed",
            transactionId: transactionId,
        });

        await payment.save();

        res.status(201).json({
            success: true,
            message: "Payment processed successfully!",
            payment,
        });
    } catch (error) {
        console.error("processPayment Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error: " + error.message,
        });
    }
};

// Get Client Payment History
exports.getClientPayments = async (req, res) => {
    try {
        const { clientId } = req.params;
        const payments = await Payment.find({ client: clientId })
            .populate("advocate", "fullName name email specialization")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            payments,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
