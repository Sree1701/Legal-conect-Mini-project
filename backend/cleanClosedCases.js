const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Complaint = require("./models/Complaint");

const cleanClosedCases = async () => {
  try {
    console.log("Connecting to MongoDB to clean closed cases...");
    await connectDB();

    const allCases = await Complaint.find({});
    console.log(`Total cases found in DB: ${allCases.length}`);

    allCases.forEach(c => {
      console.log(`ID: ${c._id} | Title: "${c.title}" | Status: "${c.status}" | Created: ${c.createdAt}`);
    });

    const result = await Complaint.deleteMany({
      status: { $in: ["Closed", "Case Closed"] }
    });

    console.log(`\nDeleted ${result.deletedCount} closed case(s).`);

    const remainingCases = await Complaint.find({});
    console.log(`Remaining cases count: ${remainingCases.length}`);
    remainingCases.forEach(c => {
      console.log(`Remaining -> ID: ${c._id} | Title: "${c.title}" | Status: "${c.status}"`);
    });

    process.exit(0);
  } catch (err) {
    console.error("Error cleaning closed cases:", err);
    process.exit(1);
  }
};

cleanClosedCases();
