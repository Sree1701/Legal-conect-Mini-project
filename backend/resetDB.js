const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Complaint = require("./models/Complaint");
const LoginLog = require("./models/LoginLog");
const bcrypt = require("bcrypt");

const resetDatabase = async () => {
  try {
    console.log("Connecting to MongoDB for Database Reset...");
    await connectDB();

    console.log("Clearing all non-admin users (Clients & Advocates)...");
    const userRes = await User.deleteMany({ role: { $ne: "admin" } });
    console.log(`Deleted ${userRes.deletedCount} client/advocate accounts.`);

    console.log("Clearing all registered cases/complaints...");
    const caseRes = await Complaint.deleteMany({});
    console.log(`Deleted ${caseRes.deletedCount} cases.`);

    console.log("Clearing all login audit logs...");
    const logRes = await LoginLog.deleteMany({});
    console.log(`Deleted ${logRes.deletedCount} login history records.`);

    // Seed/verify default admin account
    const adminEmail = "admin@gmail.com";
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      admin = new User({
        fullName: "System Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        advocateStatus: "Approved",
      });
      await admin.save();
      console.log("Created fresh Default Admin account (admin@gmail.com / admin123).");
    } else {
      admin.role = "admin";
      admin.fullName = "System Admin";
      admin.password = await bcrypt.hash("admin123", 10);
      await admin.save();
      console.log("Reset Default Admin credentials (admin@gmail.com / admin123).");
    }

    console.log("\n=======================================================");
    console.log(" SUCCESS: Database reset completed!");
    console.log(" All previous advocate and client records removed.");
    console.log(" Ready to start clean from fresh state.");
    console.log(" Admin Portal Login: admin@gmail.com | Password: admin123");
    console.log("=======================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  }
};

resetDatabase();
