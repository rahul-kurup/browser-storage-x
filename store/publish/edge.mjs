// https://github.com/PlasmoHQ/edge-addons-api

import { EdgeAddonsAPI } from '@plasmohq/edge-addons-api';
import { edgeConfig, notes } from './helpers.mjs';

const { filePath, ...config } = edgeConfig;

const store = new EdgeAddonsAPI(config);

try {
  await store.submit({ filePath, notes });
  console.log('Published to Edge');
} catch (error) {
  console.error('Submit error occurred');
  console.error(error);
  process.exit(1);
}
