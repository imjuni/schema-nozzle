import { getResolvedPaths } from '#/configs/getResolvedPaths';
import { getSchemaGeneratorOption } from '#/configs/getSchemaGeneratorOption';
import fs from 'fs/promises';
import * as mnf from 'my-node-fp';
import path from 'node:path';
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
    vitest.stubEnv('INIT_CWD', path.join(originPath, 'examples'));
    data.resolvedPaths = getResolvedPaths({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      output: path.join(originPath, 'examples'),
    });
  });

  it('undefined', async () => {
    const option = await getSchemaGeneratorOption({
      $kind: 'add-schema',
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
      encodeRefs: false,
      additionalProperties: false,
    });
  });

  it('option object', async () => {
    const option = await getSchemaGeneratorOption({
      $kind: 'add-schema',
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
      $kind: 'add-schema',
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

  it('option from file', async () => {
    vitest.spyOn(mnf, 'exists').mockImplementationOnce(async () => false);

    try {
      await getSchemaGeneratorOption({
        $kind: 'add-schema',
        project: data.resolvedPaths.project,
        skipError: false,
        generatorOption: path.join(originPath, 'examples', '.tjsgrc'),
      });
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });
});
