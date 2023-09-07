import * as esbuild from 'esbuild';
import readPkg from 'read-pkg';

const pkg = readPkg.sync();

await esbuild.build({
  entryPoints: ['src/cli.ts'],
  target: 'es2021',
  bundle: true,
  sourcemap: true,
  platform: 'node',
  // minify: true,
  outfile: 'dist/cli.cjs',
  format: 'cjs',
  external: Object.keys(pkg.dependencies),
});
