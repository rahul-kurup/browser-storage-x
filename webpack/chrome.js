require('dotenv').config();
const { buildConfig } = require('./base');

module.exports = buildConfig('chrome', process.env.DIST_CHROMIUM);
