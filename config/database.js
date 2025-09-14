const mongoose = require("mongoose");
require("dotenv").config();
const MONGODB_URI = process.env.MONGODB_URI;

console.log("URI", MONGODB_URI);
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return mongoose.connections[0];
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log("✅ Connected to MongoDB");
    return mongoose.connections[0];
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

module.exports = { connectToDatabase };
