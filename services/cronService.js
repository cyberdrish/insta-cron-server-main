const cron = require("node-cron")
const { getDueInstagramPosts, publishInstagramPost } = require("./instagramService")
const { getDueTwitterPosts, publishTwitterPost } = require("./twitterService")

function startCronJob() {
  console.log("⏰ Starting social media publisher cron job (every 5 seconds)...")
  cron.schedule("*/30 * * * * *", processDuePosts)
  // Run once on startup
  processDuePosts()
}

async function processDuePosts() {
  try {
    console.log("⏰ Checking for due posts...")
    
    // Process Instagram posts
    await processInstagramPosts()
    
    // Process Twitter posts
    await processTwitterPosts()
    
  } catch (error) {
    console.error("❌ Error in cron job:", error)
  }
}

async function processInstagramPosts() {
  try {
    console.log("📸 Checking for due Instagram posts...")
    const duePosts = await getDueInstagramPosts()
    if (duePosts.length === 0) {
      console.log("⏳ No due Instagram posts found")
      return
    }
    console.log(`🎯 Found ${duePosts.length} due Instagram posts`)
    for (const post of duePosts) {
      await publishInstagramPost(post)
      // Add a small delay between posts to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  } catch (error) {
    console.error("❌ Error in Instagram processing:", error)
  }
}

async function processTwitterPosts() {
  try {
    console.log("🐦 Checking for due Twitter posts...")
    const duePosts = await getDueTwitterPosts()
    if (duePosts.length === 0) {
      console.log("⏳ No due Twitter posts found")
      return
    }
    console.log(`🎯 Found ${duePosts.length} due Twitter posts`)
    for (const post of duePosts) {
      console.log("post", post.caption)
      
      await publishTwitterPost(post)
      // Add a small delay between posts to avoid rate limiting
      // await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  } catch (error) {
    console.error("❌ Error in Twitter processing:", error)
  }
}

module.exports = { startCronJob }