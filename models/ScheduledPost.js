const mongoose = require("mongoose")

const ScheduledPostSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    platform: { type: String, required: true, enum: ["instagram", "facebook"] },
    accountId: { type: String, required: true },
    image: { type: String, required: true },
    caption: { type: String, required: true },
    scheduledFor: { type: String, required: true },
    accessToken: { type: String, required: true },
    published: { type: Boolean, default: false },
    containerId: { type: String },
    remoteId: { type: String },
    account: {
      name: { type: String },
      avatar: { type: String },
    },
  },
  { timestamps: true },
)

module.exports =
  mongoose.models["socio-scheduled-posts"] || mongoose.model("socio-scheduled-posts", ScheduledPostSchema)
