import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import zl from 'zip-lib';
import pkg from '../package.json' assert { type: 'json' };

dotenvExpand.expand(dotenv.config());

const { version } = pkg;
const dirDist = 'dist';
const distDirs = process.env.DIST_DIRS.split(',').map(m => m.trim());

async function compress() {
  for (let i = 0; i < distDirs.length; i++) {
    const dir = distDirs[i];
    await zl.archiveFolder(
      `${dirDist}/${dir}/`,
      `${dirDist}/ext_${dir}_v${version}.zip`
    );
  }
}

async function compressSource() {
  const zip = new zl.Zip();
  const dirs = ['src/', 'webpack/', 'scripts/'];
  const files = [
    '.env',
    '.prettierignore',
    '.prettierrc.json',
    'package.json',
    'README.md',
    'tsconfig.json',
    'webpack.config.js',
    'yarn.lock',
  ];
  files.forEach(f => zip.addFile(f));
  dirs.forEach(f => zip.addFolder(f, f));
  await zip.archive(`${dirDist}/_source_v${version}.zip`);
}

await compress();
await compressSource();
