import { posixJoin } from '#/modules/paths/modules/posixJoin';
import { ExcludeContainer } from '#/modules/scopes/ExcludeContainer';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { defaultExclude } from 'vitest/dist/config';

const tsconfigDir = path.join(process.cwd(), 'examples');

describe('ExcludeContainer', () => {
  it('getter', () => {
    const container = new ExcludeContainer({
      patterns: ['src/cli/**/*.ts', 'src/compilers/**/*.ts'],
      options: { absolute: true, ignore: defaultExclude, cwd: tsconfigDir },
      inlineExcludedFiles: [],
    });

    expect(container.globs).toBeDefined();
    expect(container.map).toBeDefined();
  });

  it('isExclude - no glob files', () => {
    const container = new ExcludeContainer({
      patterns: [],
      inlineExcludedFiles: [],
      options: { absolute: true, ignore: defaultExclude, cwd: tsconfigDir },
    });

    const r01 = container.isExclude('src/files/IncludeContainer.ts');
    expect(r01).toBeFalsy();
  });

  it('isExclude', () => {
    const container = new ExcludeContainer({
      patterns: ['src/modules/**/*.ts', 'src/compilers/**/*.ts', 'examples/**/*.ts'],
      inlineExcludedFiles: [
        {
          commentCode: 'inline exclude test',
          tag: 'ctix-exclude',
          pos: {
            line: 1,
            start: 1,
            column: 1,
          },
          workspaces: [],
          filePath: 'example/type03/ComparisonCls.tsx',
        },
        {
          commentCode: 'inline exclude test',
          tag: 'ctix-exclude',
          pos: {
            line: 1,
            start: 1,
            column: 1,
          },
          workspaces: [],
          filePath: path.resolve('example/type03/HandsomelyCls.tsx'),
        },
      ],
      options: { absolute: true, ignore: defaultExclude, cwd: process.cwd() },
    });

    const r01 = container.isExclude('src/databases/deleteDatabaseItem.ts');
    const r02 = container.isExclude('src/modules/prompts/getAddMultipleFilesFromPrompt.ts');
    const r03 = container.isExclude(posixJoin(process.cwd(), 'src/tools/getRatioNumber.ts'));
    const r04 = container.isExclude(posixJoin(process.cwd(), 'src/compilers/getExportedFiles.ts'));
    const r05 = container.isExclude(posixJoin(process.cwd(), 'src/compilers/getJsDocTags.ts'));

    expect(r01).toBeFalsy();
    expect(r02).toBeTruthy();
    expect(r03).toBeFalsy();
    expect(r04).toBeTruthy();
    expect(r05).toBeTruthy();
  });
});
