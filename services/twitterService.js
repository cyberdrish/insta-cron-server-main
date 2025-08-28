// const { uploadImageFromUrl } = require('../utils/twitterUpload');

require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2')
const ScheduledPost = require("../models/ScheduledPost")
const { connectToDatabase } = require("../config/database")
const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const FormData = require('form-data');



const oauth = OAuth({
  consumer: {
    key: process.env.TWITTER_API_KEY,
    secret: process.env.TWITTER_API_SECRET_KEY,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

const token = {
  key: process.env.TWITTER_ACCESS_TOKEN,
  secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
};

// Twitter API credentials - add these to your environment variables
const TWITTER_CREDENTIALS = {
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET_KEY,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
}

async function getDueTwitterPosts() {
  await connectToDatabase()
  const now = new Date()
  const posts = await ScheduledPost.find({
    platform: "twitter",
    published: false,
    scheduledFor: { $lte: now.toISOString() },
   
  }).lean()
  return posts
}


async function uploadImageFromUrlBuffer(imageUrl) {
  try {
    console.log('📥 Downloading image from URL...');
    
    // Download the image as buffer
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const imageBuffer = Buffer.from(imageResponse.data);
    const contentType = imageResponse.headers['content-type'] || 'image/jpeg';
    const extension = contentType.split('/')[1] || 'jpg';
    const filename = `downloaded-image.${extension}`;

    console.log('📤 Uploading to Twitter...');

    const url = 'https://upload.twitter.com/1.1/media/upload.json';
    const request_data = {
      url: url,
      method: 'POST',
    };

    // Create form-data object with buffer
    const form = new FormData();
    form.append('media', imageBuffer, {
      filename: filename,
      contentType: contentType,
    });

    // Generate OAuth headers
    const headers = oauth.toHeader(oauth.authorize(request_data, token));
    headers['Content-Type'] = form.getHeaders()['content-type'];

    // Send the request
    const response = await axios.post(url, form, { headers });
    const mediaId = response.data.media_id_string;
    console.log('✅ Upload successful. Media ID:', mediaId);
    return mediaId;
  } catch (error) {
    console.error('❌ Upload failed:', error.response ? error.response.data : error.message);
    throw error;
  }
}


async function postTweetWithImage(caption, mediaId) {
  try {
    const url = 'https://api.twitter.com/2/tweets';
    const request_data = {
      url: url,
      method: 'POST',
    };

    const tweetData = {
      text: caption,
      media: {
        media_ids: [mediaId], // Replace with your actual media ID
      },
    };

    // Generate OAuth headers
    const headers = oauth.toHeader(oauth.authorize(request_data, token));
    headers['Content-Type'] = 'application/json';

    // Send the request
    const response = await axios.post(url, tweetData, { headers });
    console.log('✅ Tweet posted:', response.data.data.id);
    return response.data.data.id;
  } catch (error) {
    console.error('❌ Failed to post tweet:', error.response ? error.response.data : error.message);
  }
}


async function publishTwitterPost(post) {
  try {
    console.log(`📤 Publishing Twitter post: ${post.id}`)
    console.log("post.images", post.image)

   const mediaId = await uploadImageFromUrlBuffer(post.image)
  console.log("Media ID", mediaId)

  const remoteId = await postTweetWithImage(post.caption, mediaId)
  if(remoteId){
    await markAsPublished(post.id, remoteId)
    console.log(`✅ Twitter post ${post.id} published successfully with remote ID: ${remoteId}`)
    return { success: true, remoteId }
  }

  
  } catch (error) {
    console.error(`❌ Error publishing Twitter post ${post.id}:`, error.message)
    
    // Handle specific Twitter API errors
    let errorMessage = error.message
    if (error.data?.errors) {
      errorMessage = error.data.errors.map(err => err.message).join(', ')
    }
    
    return { success: false, error: errorMessage }
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

  console.log(`${postId} Marked as published`)
}


module.exports = {
  getDueTwitterPosts,
  publishTwitterPost,
}