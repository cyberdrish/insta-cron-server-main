require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET_KEY,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

async function uploadImage() {
  try {
    const mediaId = await twitterClient.v1.uploadMedia('./image-04.jpg');
    console.log('✅ Upload successful. Media ID:', mediaId);
    return mediaId;
  } catch (error) {
    console.error('❌ Upload failed:', error);
  }
}

uploadImage();
