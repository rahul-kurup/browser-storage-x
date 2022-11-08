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
  permissions,
  icons: [16, 32, 48, 64, 128, 512, 1024].reduce(
    (a, c) => ({
      ...a,
      [c]: `assets/images/logo/${c}.png`,
    }),
    {}
  ),
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
