const fs = require('fs');
const { isDevMode } = require('./helper');

const icons = [16, 24, 32, 48, 96, 128].reduce((a, c) => {
  const coloredLogo = `assets/images/logo/${c}-colored.png`;
  const simpleLogo = `assets/images/logo/${c}.png`;
  const existColoredLogo = fs.existsSync(coloredLogo);
  const logoToUse = isDevMode && existColoredLogo ? coloredLogo : simpleLogo;

  return {
    ...a,
    [c]: logoToUse,
  };
}, {});

module.exports = icons;
