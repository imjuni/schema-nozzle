import { ExcludeContainer } from '#/modules/scopes/ExcludeContainer';
import pathe from 'pathe';
import { describe, expect, it } from 'vitest';
import { defaultExclude } from 'vitest/dist/config';

const tsconfigDir = pathe.join(process.cwd(), 'examples');

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
          tag: 'schema-nozzle-exclude',
          pos: {
            line: 1,
            start: 1,
            column: 1,
          },
          workspaces: [],
          filePath: 'src/databases/createRecord.ts',
        },
        {
          commentCode: 'inline exclude test',
          tag: 'schema-nozzle-exclude',
          pos: {
            line: 1,
            start: 1,
            column: 1,
          },
          workspaces: [],
          filePath: pathe.resolve('src/compilers/getExportedFiles.ts'),
        },
      ],
      options: { absolute: true, ignore: defaultExclude, cwd: process.cwd() },
    });

    const r01 = container.isExclude('src/databases/createRecord.ts');
    const r02 = container.isExclude('src/modules/prompts/getAddMultipleFilesFromPrompt.ts');
    const r03 = container.isExclude(pathe.join(process.cwd(), 'src/tools/getRatioNumber.ts'));
    const r04 = container.isExclude(pathe.join(process.cwd(), 'src/compilers/getExportedFiles.ts'));
    const r05 = container.isExclude(
      pathe.join(process.cwd(), 'src/compilers/comments/getJsDocTags.ts'),
    );

    expect(r01).toBeTruthy();
    expect(r02).toBeTruthy();
    expect(r03).toBeFalsy();
    expect(r04).toBeTruthy();
    expect(r05).toBeTruthy();
  });
});
