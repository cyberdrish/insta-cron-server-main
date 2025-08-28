const express = require("express")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const { connectToDatabase } = require("./config/database")
const { startCronJob } = require("./services/cronService")
const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');


// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Simple health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Instagram Publisher Service",
    status: "running",
    timestamp: new Date().toISOString(),
  })
})


// Start server and cron job
async function startService() {
  try {
    // Connect to database
    await connectToDatabase()

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Publisher Service running on port ${PORT}`)
    })

    // Start cron job
    startCronJob()

    console.log("✅ Service started successfully")
  } catch (error) {
    console.error("❌ Failed to start service:", error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down Instagram Publisher Service...")
  await mongoose.connection.close()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down Instagram Publisher Service...")
  await mongoose.connection.close()
  process.exit(0)
})

// Start the service
startService()
