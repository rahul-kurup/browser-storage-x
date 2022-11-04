const { name, defaultManifest } = require('./helper');

module.exports = {
  ...defaultManifest,
  manifest_version: 3,
  host_permissions: ['<all_urls>'],
  action: {
    default_title: name,
    default_popup: 'assets/html/popup.html',
    default_icon: 'assets/images/logo.png',
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
