import * as esbuild from 'esbuild';
import readPkg from 'read-pkg';

const pkg = readPkg.sync();

if (process.env.FORMAT !== 'cjs' && process.env.FORMAT !== 'esm') {
  console.log(`support "cjs" or "esm"`);
  console.log(`eg. FORMAT=cjs node esbuild.mjs`);

  process.exit(1);
}

console.log(`esbuild: ${process.env.FORMAT}`);

await esbuild.build({
  entryPoints: ['src/index.ts'],
  target: 'es2021',
  bundle: true,
  sourcemap: true,
  platform: 'node',
  // minify: true,
  outfile: process.env.FORMAT === 'cjs' ? 'dist/cjs/index.cjs' : 'dist/esm/index.mjs',
  format: process.env.FORMAT,
  external: Object.keys(pkg.dependencies),
});
