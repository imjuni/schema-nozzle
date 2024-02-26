import getResolvedPaths from '#/configs/getResolvedPaths';
import type TAddSchemaOption from '#/configs/interfaces/TAddSchemaOption';
import * as env from '#/modules/__tests__/env';
import NozzleContext from '#/workers/NozzleContext';
import path from 'path';
import type * as tsm from 'ts-morph';
import { beforeEach, describe, expect, it } from 'vitest';

const originPath = process.cwd();
process.env.USE_INIT_CWD = 'true';
process.env.INIT_CWD = path.join(originPath, 'examples');
const data: {
  resolvedPaths: ReturnType<typeof getResolvedPaths>;
  project: tsm.Project;
  option: TAddSchemaOption;
} = {} as any;

beforeEach(() => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
  data.resolvedPaths = getResolvedPaths({
    project: path.join(originPath, 'examples', 'tsconfig.json'),
    output: path.join(originPath, 'examples'),
  });
  data.option = { ...data.option, ...data.resolvedPaths };
});

describe('NozzleContext', () => {
  it('project', async () => {
    const ctx = new NozzleContext();
    ctx.project = {} as any;

    expect(ctx.project).toBeTruthy();
  });

  it('project - empty', async () => {
    const ctx = new NozzleContext();

    try {
      console.log(ctx.project);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('option - add', async () => {
    const ctx = new NozzleContext();
    ctx.option = env.addCmdOption;
    expect(ctx.option).toBeTruthy();
  });

  it('option - refresh', async () => {
    const ctx = new NozzleContext();
    ctx.option = env.refreshCmdOption;
    expect(ctx.option).toBeTruthy();
  });

  it('option - watch', async () => {
    const ctx = new NozzleContext();
    ctx.option = { ...env.addCmdOption, discriminator: 'watch-schema', debounceTime: 1000 };
    expect(ctx.option).toBeTruthy();
  });

  it('option - empty', async () => {
    const ctx = new NozzleContext();

    try {
      console.log(ctx.option);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('generatorOption', async () => {
    const ctx = new NozzleContext();
    ctx.generatorOption = {};
    expect(ctx.generatorOption).toBeTruthy();
  });

  it('generatorOption - empty', async () => {
    const ctx = new NozzleContext();

    try {
      console.log(ctx.generatorOption);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('generatorOption', async () => {
    const ctx = new NozzleContext();
    ctx.generatorOption = {};
    expect(ctx.generatorOption).toBeTruthy();
  });

  it('generator', async () => {
    const ctx = new NozzleContext();
    ctx.generator = {} as any;
    expect(ctx.generator).toBeTruthy();
  });

  it('generator - empty', async () => {
    const ctx = new NozzleContext();

    try {
      console.log(ctx.generator);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('updateFiles', async () => {
    const ctx = new NozzleContext();
    ctx.option = env.addCmdOption;
    ctx.updateFiles(['a', 'b']);
    expect(ctx.option.files).toEqual(['a', 'b']);
  });

  it('updateFiles - empty', async () => {
    const ctx = new NozzleContext();

    try {
      ctx.updateFiles(['a', 'b']);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('updateTypes', async () => {
    const ctx = new NozzleContext();
    ctx.option = env.addCmdOption;
    ctx.updateTypes(['a', 'b']);
    expect(ctx.option.types).toEqual(['a', 'b']);
  });

  it('updateTypes - empty', async () => {
    const ctx = new NozzleContext();

    try {
      ctx.updateTypes(['a', 'b']);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
