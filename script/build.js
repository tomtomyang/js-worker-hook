const esbuild = require('esbuild');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

const input = path.join(__dirname, '../src/index.ts');
const output = path.join(
  __dirname,
  isProduction ? '../dist/hook.min.js' : '../dist/hook.js',
);

async function run() {
  try {
    await esbuild.build({
      entryPoints: [input],
      outfile: output,
      minify: isProduction,
      bundle: true,
      sourcemap: false,
      write: true,
      treeShaking: true,
      platform: 'browser',
      format: 'esm',
      target: 'es2020',
      conditions: ['worker'],
      charset: isProduction ? 'ascii' : 'utf8',
    });

    console.log('Hook build successfully.');
  } catch (err) {
    console.error('Hook build error: ', err.message);
  }
}

run();
