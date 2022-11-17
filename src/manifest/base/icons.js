const fs = require('fs');
const path = require('path');
const { isDevMode } = require('./helper');

const assetPath = ['assets', 'images', 'logo'].join('/');

const icons = [16, 24, 32, 48, 96, 128].reduce((a, c) => {
  const simpleLogo = `${assetPath}/${c}.png`;
  const coloredLogo = `${assetPath}/${c}-colored.png`;
  const coloredLogoFullpath = path.join(process.cwd(), 'src', coloredLogo);
  const coloredLogoExists = fs.existsSync(coloredLogoFullpath);
  const logoToUse = isDevMode && coloredLogoExists ? coloredLogo : simpleLogo;

  return {
    ...a,
    [c]: logoToUse,
  };
}, {});

module.exports = icons;
