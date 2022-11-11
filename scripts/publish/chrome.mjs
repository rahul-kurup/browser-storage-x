// https://github.com/fregante/chrome-webstore-upload
import chromeWebstoreUpload from 'chrome-webstore-upload';
import fs from 'fs';
import { chromeConfig } from './helpers.mjs';

const { filePath, ...config } = chromeConfig;

const store = chromeWebstoreUpload(config);

const token = await store.fetchToken();

// https://developer.chrome.com/webstore/webstore_api/items#resource
const upload = await store.uploadExisting(fs.createReadStream(filePath), token);

if (upload.uploadState === 'SUCCESS') {
  console.log('Chrome: Zip uploaded');
} else {
  console.error('Chrome: Upload error occurred', upload);
  process.exit(1);
}

const target = 'default'; // optional. Can also be 'trustedTesters'
// https://developer.chrome.com/webstore/webstore_api/items/publish
const publish = await store.publish(target, token);

if (publish.status.includes('OK')) {
  console.log('Chrome: Published');
} else {
  console.error('Chrome: Publish error occurred', publish);
  process.exit(1);
}
