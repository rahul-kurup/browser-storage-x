import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import zl from 'zip-lib';

dotenvExpand.expand(dotenv.config());

if (process.env.COMPRESS_PROG){
  console.log('compress_running');
} else {
  process.env.COMPRESS_PROG = 'start';
}

const dirDist = 'dist';
const distDirs = process.env.DIST_DIRS.split(',').map(m => m.trim());

async function compress() {
  for (let i = 0; i < distDirs.length; i++) {
    const dir = distDirs[i];
    await zl.archiveFolder(`${dirDist}/${dir}`, `${dirDist}/ext_${dir}.zip`);
  }

  // await compressSource();
}

async function compressSource() {
  const zip = new zl.Zip();
  const dirs = ['src/', 'webpack/', 'scripts/'];
  const files = [
    '.env',
    '.prettierignore',
    '.prettierrc.json',
    'package.json',
    'postcss.config.js',
    'README.md',
    'tsconfig.json',
    'webpack.config.js',
    'yarn.lock',
  ];
  files.forEach(f => zip.addFile(f));
  dirs.forEach(f => zip.addFolder(f, f));
  await zip.archive(`${dirDist}/_source.zip`);
}

await compress();
await compressSource();
