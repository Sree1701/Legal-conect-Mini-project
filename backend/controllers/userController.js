const User = require("../models/User");

// Get All Advocates with calculated Experience
exports.getAdvocates = async (req, res) => {
    try {
        const advocates = await User.find({ role: "advocate" }).select("-password").lean();
        const currentYear = new Date().getFullYear();

        const formattedAdvocates = advocates.map((adv) => {
            const exp = adv.enrollmentYear ? Math.max(0, currentYear - adv.enrollmentYear) : 0;
            return {
                ...adv,
                id: adv._id,
                name: adv.fullName,
                experience: exp,
                specialization: adv.specialization || "General Legal Practice",
                bio: adv.bio || "",
                officeAddress: adv.officeAddress || "",
                consultationFee: adv.consultationFee !== undefined && adv.consultationFee !== null ? adv.consultationFee : null,
                advocateStatus: adv.advocateStatus || "Pending Verification",
            };
        });

        res.status(200).json({
            success: true,
            count: formattedAdvocates.length,
            data: formattedAdvocates,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update Advocate Profile
exports.updateAdvocateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, phone, specialization, bio, officeAddress, consultationFee } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found",
            });
        }

        if (fullName) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (specialization !== undefined) user.specialization = specialization;
        if (bio !== undefined) user.bio = bio;
        if (officeAddress !== undefined) user.officeAddress = officeAddress;
        if (fullName) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (specialization !== undefined) user.specialization = specialization;
        if (bio !== undefined) user.bio = bio;
        if (officeAddress !== undefined) user.officeAddress = officeAddress;
        if (consultationFee !== undefined) {
            user.consultationFee = (consultationFee === "" || consultationFee === null) ? null : Number(consultationFee);
        }

        await user.save();

        const currentYear = new Date().getFullYear();
        const expYears = user.enrollmentYear ? Math.max(0, currentYear - user.enrollmentYear) : 0;

        const updatedUser = {
            id: user._id,
            _id: user._id,
            fullName: user.fullName,
            name: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            barCouncilId: user.barCouncilId || "",
            enrollmentYear: user.enrollmentYear || null,
            experience: expYears,
            specialization: user.specialization || "General Legal Practice",
            bio: user.bio || "",
            officeAddress: user.officeAddress || "",
            consultationFee: user.consultationFee !== undefined && user.consultationFee !== null ? user.consultationFee : null,
            advocateStatus: user.advocateStatus || "Pending Verification",
            availableSlots: user.availableSlots || [],
            workingHours: user.workingHours || {},
        };

        res.status(200).json({
            success: true,
            message: "Advocate profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Advocate Available Slots
exports.getAdvocateSlots = async (req, res) => {
    try {
        const { id } = req.params;
        const advocate = await User.findById(id).select("availableSlots workingHours fullName specialization consultationFee");
        if (!advocate) {
            return res.status(404).json({ success: false, message: "Advocate not found" });
        }

        res.status(200).json({
            success: true,
            availableSlots: advocate.availableSlots || [],
            workingHours: advocate.workingHours || {},
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add Single Preferred Slot
exports.addAdvocateSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, startTime, endTime, duration, fee } = req.body;

        if (!date || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: "Date, start time, and end time are required." });
        }

        const advocate = await User.findById(id);
        if (!advocate) {
            return res.status(404).json({ success: false, message: "Advocate account not found" });
        }

        const calculatedFee = (fee !== undefined && fee !== "" && fee !== null) 
            ? Number(fee) 
            : (advocate.consultationFee !== undefined && advocate.consultationFee !== null ? advocate.consultationFee : null);

        const newSlot = {
            slotId: new require("mongoose").Types.ObjectId().toString(),
            date,
            startTime,
            endTime,
            duration: Number(duration) || 30,
            fee: calculatedFee,
            isBooked: false,
        };

        advocate.availableSlots.push(newSlot);
        await advocate.save();

        res.status(201).json({
            success: true,
            message: "Preferred booking slot added successfully",
            slots: advocate.availableSlots,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Auto Generate Daily Slots
exports.autoGenerateSlots = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, startTime, endTime, slotDuration, fee } = req.body;

        if (!date) {
            return res.status(400).json({ success: false, message: "Date is required." });
        }

        const advocate = await User.findById(id);
        if (!advocate) {
            return res.status(404).json({ success: false, message: "Advocate account not found" });
        }

        const duration = Number(slotDuration) || advocate.workingHours?.slotDuration || 30;
        const slotFee = (fee !== undefined && fee !== "" && fee !== null) 
            ? Number(fee) 
            : (advocate.consultationFee !== undefined && advocate.consultationFee !== null ? advocate.consultationFee : null);

        // Standard time parsing helper (e.g. "09:00 AM" to minutes)
        const parseMinutes = (timeStr) => {
            if (!timeStr) return 540; // 9 AM default
            let [time, modifier] = timeStr.trim().split(" ");
            let [hours, minutes] = time.split(":").map(Number);
            if (modifier && modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
            if (modifier && modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
            return hours * 60 + minutes;
        };

        const formatTime = (totalMin) => {
            let hours = Math.floor(totalMin / 60);
            let minutes = totalMin % 60;
            let modifier = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            if (hours === 0) hours = 12;
            return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${modifier}`;
        };

        const startMin = parseMinutes(startTime || advocate.workingHours?.startTime || "09:00 AM");
        const endMin = parseMinutes(endTime || advocate.workingHours?.endTime || "05:00 PM");

        const generated = [];
        let curr = startMin;
        while (curr + duration <= endMin) {
            const slotStart = formatTime(curr);
            const slotEnd = formatTime(curr + duration);

            // Check if already exists for this date and startTime
            const exists = advocate.availableSlots.some(
                (s) => s.date === date && s.startTime === slotStart
            );

            if (!exists) {
                generated.push({
                    slotId: new require("mongoose").Types.ObjectId().toString(),
                    date,
                    startTime: slotStart,
                    endTime: slotEnd,
                    duration,
                    fee: slotFee,
                    isBooked: false,
                });
            }

            curr += duration;
        }

        advocate.availableSlots.push(...generated);
        await advocate.save();

        res.status(200).json({
            success: true,
            message: `Generated ${generated.length} preferred slots for ${date}`,
            slots: advocate.availableSlots,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Unbooked Slot
exports.deleteAdvocateSlot = async (req, res) => {
    try {
        const { id, slotId } = req.params;
        const advocate = await User.findById(id);

        if (!advocate) {
            return res.status(404).json({ success: false, message: "Advocate not found" });
        }

        const slot = advocate.availableSlots.find((s) => String(s.slotId) === String(slotId));
        if (slot && slot.isBooked) {
            return res.status(400).json({ success: false, message: "Cannot delete a slot that has already been booked by a client." });
        }

        advocate.availableSlots = advocate.availableSlots.filter((s) => String(s.slotId) !== String(slotId));
        await advocate.save();

        res.status(200).json({
            success: true,
            message: "Slot removed successfully",
            slots: advocate.availableSlots,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

