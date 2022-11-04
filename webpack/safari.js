require('dotenv').config();
const { buildConfig } = require('./base');

module.exports = buildConfig('safari', process.env.DIST_SAFARI);
