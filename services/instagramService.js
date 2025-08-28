const fetch = require("node-fetch")
const ScheduledPost = require("../models/ScheduledPost")
const { connectToDatabase } = require("../config/database")

const GRAPH_VERSION = process.env.IG_API_VERSION || "v19.0"
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`

async function getDueInstagramPosts() {
  await connectToDatabase()

  const now = new Date()
  const posts = await ScheduledPost.find({
    platform: "instagram",
    published: false,
    scheduledFor: { $lte: now.toISOString() },
    containerId: { $exists: true, $ne: null },
  }).lean()

  return posts
}

async function publishInstagramPost(post) {
  try {
    console.log(`📤 Publishing Instagram post: ${post.id}`)

    const publishRes = await fetch(
      `${GRAPH}/${post.accountId}/media_publish` +
        `?creation_id=${post.containerId}` +
        `&access_token=${post.accessToken}`,
      { method: "POST" },
    )

    const result = await publishRes.json()

    if (!publishRes.ok || !result.id) {
      console.error(`❌ Failed to publish post ${post.id}:`, result.error?.message || "Unknown error")
      return { success: false, error: result.error?.message || "Publish failed" }
    }

    await markAsPublished(post.id, result.id)

    console.log(`✅ Successfully published Instagram post: ${post.id} -> ${result.id}`)
    return { success: true, remoteId: result.id }
  } catch (error) {
    console.error(`❌ Error publishing post ${post.id}:`, error)
    return { success: false, error: error.message }
  }
}

async function markAsPublished(postId, remoteId) {
  await connectToDatabase()

  await ScheduledPost.findOneAndUpdate(
    { id: postId },
    {
      published: true,
      remoteId: remoteId,
      publishedAt: new Date(),
    },
    { new: true },
  )
}

module.exports = {
  getDueInstagramPosts,
  publishInstagramPost,
}
