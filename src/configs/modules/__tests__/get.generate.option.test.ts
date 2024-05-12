import { makePackageJson } from '#/configs/makePackageJson';
import { getGenerateOption } from '#/configs/modules/getGenerateOption';
import { beforeAll, describe, expect, it } from 'vitest';

describe('getGenerateOption', () => {
  beforeAll(() => {
    makePackageJson();
  });

  it('nullable field with generator option', async () => {
    const option = await getGenerateOption({
      project: 'tsconfig.json',
    });

    expect(option).toMatchObject({
      include: [],
      exclude: [],
      rootDirs: [process.cwd()],
      skipError: true,
      useSchemaPath: false,
      serverUrl: 'schema-nozzle',
      generatorOption: {
        minify: false,
        expose: 'export',
        jsDoc: 'extended',
        sortProps: true,
        topRef: false,
        strictTuples: true,
        encodeRefs: false,
        additionalProperties: false,
        tsconfig: 'tsconfig.json',
        skipTypeCheck: true,
      },
    });
  });
});
