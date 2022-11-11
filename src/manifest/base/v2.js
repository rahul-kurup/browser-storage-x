const { name, permissions, defaultManifest } = require('./helper');
const icons = require('./icons');

module.exports = {
  ...defaultManifest,
  icons,
  manifest_version: 2,
  permissions: [...permissions, 'https://*/*'],
  browser_action: {
    default_title: name,
    default_popup: 'assets/html/popup.html',
  },
  background: {
    scripts: ['background.js'],
  },
  web_accessible_resources: ['assets/**'],
  // ...(process.env.NODE_ENV === 'development' ? {
  //   content_security_policy: "script-src 'self' 'unsafe-eval'; font-src 'self' data: https://fonts.gstatic.com/s/dmsans; object-src 'self';"
  // } : {})
};
