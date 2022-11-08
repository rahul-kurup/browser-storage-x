const chrome = require('./webpack/chrome');
const firefox = require('./webpack/firefox');
// const safari = require('./webpack/safari'); // Not supporting Safari for now

module.exports = [chrome, firefox];
