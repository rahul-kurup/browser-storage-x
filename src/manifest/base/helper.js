const { version, displayName, description } = require('../../../package.json');
const permissions = require('../permissions');

const isDevMode = process.env.NODE_ENV?.includes('dev');

const getExtName = name => name + (isDevMode ? ' [dev]' : '');

const name = getExtName(displayName);

const defaultManifest = {
  name,
  version,
  description,
  short_name: name,
  permissions,
  content_scripts: [
    {
      matches: ['<all_urls>'],
      // css: ["styles.css"],
      js: ['content.js'],
    },
  ],
};

module.exports = {
  name,
  version,
  isDevMode,
  getExtName,
  displayName,
  description,
  permissions,
  defaultManifest,
};
