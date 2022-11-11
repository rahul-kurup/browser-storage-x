import dotenv from 'dotenv';
import args from 'node-args';
import { join } from 'path';
import pkg from '../../package.json' assert { type: 'json' };

dotenv.config({ path: '.env.local' });

const { version } = pkg;

const notes = args.n || 'bug fixes';

const filePath = join('dist', `ext_chromium_v${version}.zip`);

const edgeConfig = {
  clientId: process.env.EDGE_CLIENT_ID,
  clientSecret: process.env.EDGE_CLIENT_SECRET,
  productId: process.env.EDGE_EXT_ID,
  accessTokenUrl: process.env.EDGE_ACCESS_TOKEN_URL,
  filePath,
};

const chromeConfig = {
  refreshToken: process.env.CHROME_REFRESH_TOKEN,
  clientId: process.env.CHROME_CLIENT_ID,
  clientSecret: process.env.CHROME_CLIENT_SECRET,
  extensionId: process.env.CHROME_EXT_ID,
  filePath,
};

export { notes, version, edgeConfig, chromeConfig };
