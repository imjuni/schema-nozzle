import { getResolvedPaths } from '#/configs/getResolvedPaths';
import { getSchemaGeneratorOption } from '#/configs/modules/getSchemaGeneratorOption';
import fs from 'fs/promises';
import * as mnf from 'my-node-fp';
import pathe from 'pathe';
import { beforeEach, describe, expect, it, vitest } from 'vitest';

vitest.mock('my-node-fp', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const mod = await importOriginal<typeof import('my-node-fp')>();
  return {
    ...mod,
  };
});

const originPath = process.env.INIT_CWD!;
const data: { resolvedPaths: ReturnType<typeof getResolvedPaths> } = {} as any;

describe('getSchemaGeneratorOption', () => {
  beforeEach(() => {
    vitest.stubEnv('INIT_CWD', pathe.join(originPath, 'examples'));
    data.resolvedPaths = getResolvedPaths({
      rootDirs: [],
      project: $context.tsconfigFilePath,
      output: $context.tsconfigDirPath,
    });
  });

  it('undefined', async () => {
    const option = await getSchemaGeneratorOption({
      project: data.resolvedPaths.project,
      skipError: true,
      generatorOption: undefined,
    });

    expect(option).toMatchObject({
      tsconfig: data.resolvedPaths.project,
      minify: false,
      expose: 'export',
      jsDoc: 'extended',
      skipTypeCheck: true,
      sortProps: true,
      strictTuples: true,
      encodeRefs: false,
      additionalProperties: false,
    });
  });

  it('option object, encodeRefs is false', async () => {
    const option = await getSchemaGeneratorOption({
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
        encodeRefs: false,
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
      encodeRefs: false,
      additionalProperties: true,
    });
  });

  it('option from file', async () => {
    vitest.spyOn(mnf, 'exists').mockImplementationOnce(async () => true);
    vitest.spyOn(fs, 'readFile').mockImplementationOnce(async () =>
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
          encodeRefs: false,
          additionalProperties: true,
        }),
      ),
    );

    const option = await getSchemaGeneratorOption({
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
      encodeRefs: false,
      additionalProperties: true,
    });
  });

  it('option from file, encodeRefs is undefined', async () => {
    vitest.spyOn(mnf, 'exists').mockImplementationOnce(async () => true);
    vitest.spyOn(fs, 'readFile').mockImplementationOnce(async () =>
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
          additionalProperties: true,
        }),
      ),
    );

    const option = await getSchemaGeneratorOption({
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
      encodeRefs: false,
      additionalProperties: true,
    });
  });

  it('option from file, but cannot found raise exception', async () => {
    vitest.spyOn(mnf, 'exists').mockImplementationOnce(async () => false);

    await expect(async () => {
      await getSchemaGeneratorOption({
        project: data.resolvedPaths.project,
        skipError: false,
        generatorOption: pathe.join(originPath, 'examples', '.tjsgrc'),
      });
    }).rejects.toThrowError();
  });
});
