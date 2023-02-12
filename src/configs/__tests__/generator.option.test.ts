import getResolvedPaths from '#configs/getResolvedPaths';
import getSchemaGeneratorOption from '#configs/getSchemaGeneratorOption';
import fs from 'fs/promises';
import 'jest';
import * as mnf from 'my-node-fp';
import path from 'path';

const originPath = process.env.INIT_CWD!;
const data: { resolvedPaths: ReturnType<typeof getResolvedPaths> } = {} as any;

beforeEach(() => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
  data.resolvedPaths = getResolvedPaths({
    project: path.join(originPath, 'examples', 'tsconfig.json'),
    output: path.join(originPath, 'examples'),
  });
});

describe('getSchemaGeneratorOption', () => {
  test('undefined', async () => {
    const option = await getSchemaGeneratorOption({
      discriminator: 'add-schema',
      project: data.resolvedPaths.project,
      skipError: true,
      generatorOption: undefined,
    });

    expect(option).toMatchObject({
      tsconfig: data.resolvedPaths.project,
      minify: false,
      expose: 'export',
      topRef: false,
      jsDoc: 'extended',
      skipTypeCheck: true,
      sortProps: true,
      strictTuples: true,
      encodeRefs: true,
      additionalProperties: false,
    });
  });

  test('option object', async () => {
    const option = await getSchemaGeneratorOption({
      discriminator: 'add-schema',
      project: data.resolvedPaths.project,
      skipError: false,
      generatorOption: {
        tsconfig: data.resolvedPaths.project,
        minify: true,
        expose: 'export',
        topRef: false,
        skipTypeCheck: false,
        jsDoc: 'extended',
        sortProps: true,
        strictTuples: true,
        encodeRefs: true,
        additionalProperties: true,
      },
    });

    expect(option).toMatchObject({
      tsconfig: data.resolvedPaths.project,
      minify: true,
      expose: 'export',
      topRef: false,
      skipTypeCheck: false,
      jsDoc: 'extended',
      sortProps: true,
      strictTuples: true,
      encodeRefs: true,
      additionalProperties: true,
    });
  });

  test('option from file', async () => {
    jest.spyOn(mnf, 'exists').mockImplementationOnce(async () => true);
    jest.spyOn(fs, 'readFile').mockImplementationOnce(async () =>
      Buffer.from(
        JSON.stringify({
          tsconfig: data.resolvedPaths.project,
          minify: true,
          expose: 'export',
          topRef: false,
          skipTypeCheck: false,
          jsDoc: 'extended',
          sortProps: true,
          strictTuples: true,
          encodeRefs: true,
          additionalProperties: true,
        }),
      ),
    );

    const option = await getSchemaGeneratorOption({
      discriminator: 'add-schema',
      project: data.resolvedPaths.project,
      skipError: false,
      generatorOption: './.tjsgrc',
    });

    expect(option).toMatchObject({
      tsconfig: data.resolvedPaths.project,
      minify: true,
      expose: 'export',
      topRef: false,
      skipTypeCheck: false,
      jsDoc: 'extended',
      sortProps: true,
      strictTuples: true,
      encodeRefs: true,
      additionalProperties: true,
    });
  });

  test('option from file', async () => {
    jest.spyOn(mnf, 'exists').mockImplementationOnce(async () => false);

    try {
      await getSchemaGeneratorOption({
        discriminator: 'add-schema',
        project: data.resolvedPaths.project,
        skipError: false,
        generatorOption: path.join(originPath, 'examples', '.tjsgrc'),
      });
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });
});
