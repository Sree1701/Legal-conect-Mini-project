const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

const fixIndexes = async () => {
  try {
    console.log("Connecting to MongoDB to clean stale indexes...");
    await connectDB();

    const indexes = await User.collection.indexes();
    console.log("Current MongoDB Indexes on 'users' collection:");
    console.log(indexes);

    for (const index of indexes) {
      if (index.name !== "_id_" && index.name !== "email_1") {
        console.log(`Dropping legacy stale index: ${index.name}...`);
        await User.collection.dropIndex(index.name);
        console.log(`Successfully dropped index: ${index.name}`);
      }
    }

    // Sync schema indexes (ensures email_1 unique index is built correctly)
    await User.syncIndexes();
    console.log("Mongoose schema indexes synchronized successfully.");

    const updatedIndexes = await User.collection.indexes();
    console.log("Updated Indexes on 'users' collection:");
    console.log(updatedIndexes);

    process.exit(0);
  } catch (error) {
    console.error("Error fixing indexes:", error);
    process.exit(1);
  }
};

fixIndexes();
