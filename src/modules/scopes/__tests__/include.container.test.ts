import { getGlobFiles } from '#/modules/files/getGlobFiles';
import { IncludeContainer } from '#/modules/scopes/IncludeContainer';
import { defaultExclude } from '#/modules/scopes/defaultExclude';
import { Glob } from 'glob';
import pathe from 'pathe';
import { describe, expect, it } from 'vitest';

const tsconfigDir = pathe.join(process.cwd(), 'examples');

describe('IncludeContainer', () => {
  it('getter', () => {
    const container = new IncludeContainer({
      patterns: ['src/cli/**/*.ts', 'src/compilers/**/*.ts', 'examples/**/*.ts'],
      options: { absolute: true, ignore: defaultExclude, cwd: tsconfigDir },
    });

    expect(container.globs).toBeDefined();
    expect(container.map).toBeDefined();
  });

  it('isInclude - no glob files', () => {
    const container = new IncludeContainer({
      patterns: [],
      options: { absolute: true, ignore: defaultExclude, cwd: tsconfigDir },
    });

    const r01 = container.isInclude('src/files/IncludeContainer.ts');
    expect(r01).toBeFalsy();
  });

  it('isInclude', () => {
    const container = new IncludeContainer({
      patterns: ['src/modules/**/*.ts', 'src/compilers/**/*.ts', 'examples/**/*.ts'],
      options: { absolute: true, ignore: defaultExclude, cwd: process.cwd() },
    });

    const r01 = container.isInclude('src/databases/createRecord.ts');
    const r02 = container.isInclude('src/modules/prompts/getAddMultipleFilesFromPrompt.ts');
    const r03 = container.isInclude(pathe.join(process.cwd(), 'src/tools/getRatioNumber.ts'));
    const r04 = container.isInclude(pathe.join(process.cwd(), 'src/compilers/getExportedFiles.ts'));

    expect(r01).toBeFalsy();
    expect(r02).toBeTruthy();
    expect(r03).toBeFalsy();
    expect(r04).toBeTruthy();
  });

  it('files - string path', () => {
    const expactation = getGlobFiles(
      new Glob('example/type03/**/*.ts', {
        ignore: defaultExclude,
        cwd: process.cwd(),
        absolute: true,
      }),
    );
    const container = new IncludeContainer({
      patterns: ['example/type03/**/*.ts'],
      options: { absolute: true, ignore: defaultExclude, cwd: tsconfigDir },
    });

    const r01 = container.files();

    expect(r01).toEqual(expactation);
  });
});
