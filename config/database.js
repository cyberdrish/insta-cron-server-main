const mongoose = require("mongoose");

const MONGODB_URI = "mongodb://localhost:27017/Testapp";

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
