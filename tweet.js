require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET_KEY,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

async function postTweetWithImage() {
  try {
    const mediaId = '1929063242191540224'; // Replace with your actual media ID
    const newTweet = await twitterClient.v2.tweet({
      text: 'This is a test tweet 2!',
      media: {
        media_ids: [mediaId], // media_ids must be an array
      },
    });

    console.log('✅ Tweet posted:', newTweet.data.id);
  } catch (error) {
    console.error('❌ Failed to post tweet:', error);
  }
}

postTweetWithImage();