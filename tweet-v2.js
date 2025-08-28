require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');

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

async function postTweetWithImage() {
  try {
    const url = 'https://api.twitter.com/2/tweets';
    const request_data = {
      url: url,
      method: 'POST',
    };

    const tweetData = {
      text: 'This is a test tweet 2!',
      media: {
        media_ids: ['1929039435611455488'], // Replace with your actual media ID
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

postTweetWithImage();