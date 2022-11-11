// https://github.com/fregante/chrome-webstore-upload
import chromeWebstoreUpload from 'chrome-webstore-upload';
import fs from 'fs';
import { chromeConfig } from './helpers.mjs';

const { filePath, ...config } = chromeConfig;

const store = chromeWebstoreUpload(config);

const token = await store.fetchToken();

// https://developer.chrome.com/webstore/webstore_api/items#resource
const uploadStatus = await store
  .uploadExisting(fs.createReadStream(filePath), token)
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
