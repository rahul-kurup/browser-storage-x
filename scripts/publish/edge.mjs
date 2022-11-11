// https://github.com/PlasmoHQ/edge-addons-api

import { EdgeAddonsAPI } from '@plasmohq/edge-addons-api';
import { edgeConfig, notes } from './helpers.mjs';

const { filePath, ...config } = edgeConfig;

const store = new EdgeAddonsAPI(config);

try {
  await store.submit({ filePath, notes });
  console.log('Edge: Published');
} catch (error) {
  console.error('Edge: Submit error occurred', error);
  process.exit(1);
}
