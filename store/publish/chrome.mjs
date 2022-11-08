// https://github.com/fregante/chrome-webstore-upload
import chromeWebstoreUpload from 'chrome-webstore-upload';
import dotenv from 'dotenv';
import fs from 'fs';
import args from 'node-args';

dotenv.config();

const refresh_token = process.env.CHROME_REFRESH_TOKEN;
const clientId = process.env.CHROME_CLIENT_ID;
const clientSecret = process.env.CHROME_CLIENT_SECRET;
const extensionId = process.env.CHROME_EXT_ID;
const notes = args.n || '';

const token = await store.fetchToken();

const store = chromeWebstoreUpload({
  extensionId,
  clientId,
  clientSecret,
  refreshToken: 'xxxxxxxxxx',
});

const myZipFile = fs.createReadStream('dist/ext_chromium.zip');
// https://developer.chrome.com/webstore/webstore_api/items#resource
const uploadStatus = await store
  .uploadExisting(myZipFile, token)
  .then(({ uploadState }) => uploadState);

if (uploadStatus === 'SUCCESS') {
  console.log('Uploaded to chrome');
} else {
  console.error('Upload error occurred');
  process.exit(1);
}

const target = 'default'; // optional. Can also be 'trustedTesters'
// https://developer.chrome.com/webstore/webstore_api/items/publish
const publishStatus = await store
  .publish(target, token)
  .then(({ status }) => status);

if (publishStatus.includes('OK')) {
  console.log('Published to Chrome');
} else {
  console.error('Publish error occurred');
  process.exit(1);
}
