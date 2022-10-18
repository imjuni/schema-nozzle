import { nodeResolve } from '@rollup/plugin-node-resolve';
import readPackage from 'read-pkg';
import ts from 'rollup-plugin-ts';
// import ts from '@rollup/plugin-typescript';

const pkg = readPackage.sync();

export default [
  {
    input: 'lib/cli.ts',
    output: [
      {
        format: 'cjs',
        file: 'dist/cli.js',
        banner: '#!/usr/bin/env node',
      },
    ],
    plugins: [
      nodeResolve({
        resolveOnly: (module) => {
          return pkg?.dependencies?.[module] == null && pkg?.devDependencies?.[module] == null;
        },
      }),
      ts({ tsconfig: 'tsconfig.prod.json' }),
    ],
  },
  {
    input: 'lib/pipe-md.ts',
    output: [
      {
        format: 'cjs',
        file: 'dist/pipe-md.js',
        banner: '#!/usr/bin/env node',
      },
    ],
    plugins: [
      nodeResolve({
        resolveOnly: (module) => {
          return pkg?.dependencies?.[module] == null && pkg?.devDependencies?.[module] == null;
        },
      }),
      ts({ tsconfig: 'tsconfig.prod.json' }),
    ],
  },
  {
    input: 'lib/cjs.ts',
    output: [
      {
        format: 'cjs',
        file: 'dist/cjs/cjs.js',
      },
      {
        format: 'esm',
        file: 'dist/esm/esm.js',
      },
    ],
    plugins: [
      nodeResolve({
        resolveOnly: (module) => {
          return pkg?.dependencies?.[module] == null && pkg?.devDependencies?.[module] == null;
        },
      }),
      ts({ tsconfig: 'tsconfig.prod.json' }),
    ],
  },
];
