// https://github.com/fregante/chrome-webstore-upload

require('dotenv').config();
const fs = require('fs');
const axios = require('axios').default;

const refresh_token = process.env.CHROME_REFRESH_TOKEN;
const client_id = process.env.CHROME_CLIENT_ID;
const client_secret = process.env.CHROME_CLIENT_SECRET;
const app_id = process.env.CHROME_APP_ID || 'pafddkhaocklakonboekmgodcmgmfcbp';

async function publish() {
  const token = await axios
    .post('https://www.googleapis.com/oauth2/v4/token', {
      refresh_token,
      client_id,
      client_secret,
      grant_type: 'refresh_token',
    })
    .then(({ access_token }) => access_token)
    .catch(console.error);

  if (!token) {
    console.error('Invalid token');
    process.exit(1);
  }

  const form = new FormData();
  form.append('file', fs.createReadStream('file.path'));

  const headerToken = {
    'x-goog-api-version': 2,
    Authorization: `Bearer ${token}`,
  };

  const publish = await axios
    .post(
      `https://www.googleapis.com/chromewebstore/v1.1/items/${app_id}/publish`,
      {
        publishTarget: 'default',
      },
      {
        headers: headerToken,
      }
    )
    .then(({ publishState }) => publishState)
    .catch(console.error);

  if (publish === 'FAILURE') {
    console.error('Publish failed');
    process.exit(1);
  }

  console.log('Publish to Chrome');

  process.exit(0);
}

publish();
