require('dotenv').config();
const { buildConfig } = require('./base');

module.exports = buildConfig('firefox', process.env.DIST_FIREFOX);
