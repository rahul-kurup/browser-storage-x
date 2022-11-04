const { version, displayName, description } = require('../../../package.json');
const permissions = require('../permissions');

const getExtName = name =>
  name + (process.env.NODE_ENV?.includes('dev') ? ' [dev]' : '');

const name = getExtName(displayName);

const defaultManifest = {
  name,
  version,
  description,
  short_name: name,
  icons: {
    128: 'assets/images/logo.png',
  },
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
  getExtName,
  displayName,
  description,
  permissions,
  defaultManifest,
};
