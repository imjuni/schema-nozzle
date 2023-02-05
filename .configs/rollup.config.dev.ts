import { nodeResolve } from '@rollup/plugin-node-resolve';
import readPackage from 'read-pkg';
import ts from 'rollup-plugin-ts';

const pkg = readPackage.sync();

export default [
  {
    input: 'src/cli.ts',
    output: [
      {
        format: 'cjs',
        file: 'dist/cli.js',
        banner: '#!/usr/bin/env node',
      },
    ],
    plugins: [
      nodeResolve({
        resolveOnly: (module) =>
          pkg?.dependencies?.[module] == null && pkg?.devDependencies?.[module] == null,
      }),
      ts({ tsconfig: 'tsconfig.json' }),
    ],
  },
];
