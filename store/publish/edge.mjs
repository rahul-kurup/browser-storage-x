// https://github.com/PlasmoHQ/edge-addons-api

import { EdgeAddonsAPI } from '@plasmohq/edge-addons-api';
import dotenv from 'dotenv';
import args from 'node-args';

dotenv.config();

const clientId = process.env.EDGE_CLIENT_ID;
const clientSecret = process.env.EDGE_CLIENT_SECRET;
const productId = process.env.EDGE_EXT_ID;
const accessTokenUrl = process.env.EDGE_ACCESS_TOKEN_URL;
const notes = args.n || '';

const store = new EdgeAddonsAPI({
  productId,
  clientId,
  clientSecret,
  accessTokenUrl,
});

try {
  await store.submit({ filePath: 'dist/ext_chromium.zip', notes });
  console.log('Published to Edge');
} catch (error) {
  console.error('Submit error occurred');
  process.exit(1);
}
