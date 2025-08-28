require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const fs = require('fs');
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

async function uploadImage() {
  try {
    const url = 'https://upload.twitter.com/1.1/media/upload.json';
    const request_data = {
      url: url,
      method: 'POST',
    };

    // Read the image file
    const image = fs.createReadStream('./image-03.jpg');

    // Create form-data object
    const form = new FormData();
    form.append('media', image, {
      filename: 'image-02.jpg',
      contentType: 'image/jpeg',
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
  }
}

uploadImage();