require('dotenv').config();
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
    console.error('❌ Upload failed:',  error.message);
    throw error;
  }
}

// Example usage
uploadImageFromUrlBuffer('https://res.cloudinary.com/freelance-web-developer-zohayo/image/upload/v1748757790/gmaz0onhfgnanzw4tjei.jpg');