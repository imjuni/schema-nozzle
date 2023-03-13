import getResolvedPaths from '#configs/getResolvedPaths';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import * as env from '#modules/__tests__/env';
import NozzleContext from '#workers/NozzleContext';
import 'jest';
import path from 'path';
import type * as tsm from 'ts-morph';

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
  test('project', async () => {
    const ctx = new NozzleContext();
    ctx.project = {} as any;

    expect(ctx.project).toBeTruthy();
  });

  test('project - empty', async () => {
    const ctx = new NozzleContext();

    try {
      console.log(ctx.project);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test('option - add', async () => {
    const ctx = new NozzleContext();
    ctx.option = env.addCmdOption;
    expect(ctx.option).toBeTruthy();
  });

  test('option - refresh', async () => {
    const ctx = new NozzleContext();
    ctx.option = env.refreshCmdOption;
    expect(ctx.option).toBeTruthy();
  });

  test('option - watch', async () => {
    const ctx = new NozzleContext();
    ctx.option = { ...env.addCmdOption, discriminator: 'watch-schema', debounceTime: 1000 };
    expect(ctx.option).toBeTruthy();
  });

  test('option - empty', async () => {
    const ctx = new NozzleContext();

    try {
      console.log(ctx.option);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test('generatorOption', async () => {
    const ctx = new NozzleContext();
    ctx.generatorOption = {};
    expect(ctx.generatorOption).toBeTruthy();
  });

  test('generatorOption - empty', async () => {
    const ctx = new NozzleContext();

    try {
      console.log(ctx.generatorOption);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test('generatorOption', async () => {
    const ctx = new NozzleContext();
    ctx.generatorOption = {};
    expect(ctx.generatorOption).toBeTruthy();
  });

  test('generator', async () => {
    const ctx = new NozzleContext();
    ctx.generator = {} as any;
    expect(ctx.generator).toBeTruthy();
  });

  test('generator - empty', async () => {
    const ctx = new NozzleContext();

    try {
      console.log(ctx.generator);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test('updateFiles', async () => {
    const ctx = new NozzleContext();
    ctx.option = env.addCmdOption;
    ctx.updateFiles(['a', 'b']);
    expect(ctx.option.files).toEqual(['a', 'b']);
  });

  test('updateFiles - empty', async () => {
    const ctx = new NozzleContext();

    try {
      ctx.updateFiles(['a', 'b']);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test('updateTypes', async () => {
    const ctx = new NozzleContext();
    ctx.option = env.addCmdOption;
    ctx.updateTypes(['a', 'b']);
    expect(ctx.option.types).toEqual(['a', 'b']);
  });

  test('updateTypes - empty', async () => {
    const ctx = new NozzleContext();

    try {
      ctx.updateTypes(['a', 'b']);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
