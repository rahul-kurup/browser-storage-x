const { name, defaultManifest } = require('./helper');
const icons = require('./icons');

module.exports = {
  ...defaultManifest,
  icons,
  manifest_version: 3,
  host_permissions: ['<all_urls>'],
  action: {
    default_title: name,
    default_popup: 'assets/html/popup.html',
    default_icon: icons['128'],
  },
  background: {
    service_worker: 'background.js',
  },
  web_accessible_resources: [
    {
      resources: ['assets/**'],
      matches: ['<all_urls>'],
    },
  ],
};
