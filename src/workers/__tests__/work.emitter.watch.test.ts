import getResolvedPaths from '#configs/getResolvedPaths';
import getSchemaGeneratorOption from '#configs/getSchemaGeneratorOption';
import * as env from '#modules/__tests__/env';
import { CE_WATCH_EVENT } from '#modules/interfaces/CE_WATCH_EVENT';
import NozzleContext from '#workers/NozzleContext';
import NozzleEmitter from '#workers/NozzleEmitter';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import 'jest';
import path from 'path';
import * as tjsg from 'ts-json-schema-generator';
import * as tsm from 'ts-morph';

const originPath = process.cwd();
process.env.USE_INIT_CWD = 'true';
process.env.INIT_CWD = path.join(originPath, 'examples');
const ctx = new NozzleContext();
const data: {
  exit: jest.SpyInstance | undefined;
  send: jest.SpyInstance | undefined;
} = { exit: undefined, send: undefined };

beforeAll(async () => {
  ctx.project = new tsm.Project({
    tsConfigFilePath: path.join(originPath, 'examples', 'tsconfig.json'),
  });
  ctx.option = {
    ...env.addCmdOption,
    ...getResolvedPaths({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      output: path.join(originPath, 'examples'),
    }),
    generatorOptionObject: await getSchemaGeneratorOption({
      discriminator: 'add-schema',
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      generatorOption: undefined,
      skipError: env.addCmdOption.skipError,
    }),
  };
  ctx.generator = tjsg.createGenerator({
    ...ctx.option.generatorOptionObject,
    type: '*',
  });
});

beforeEach(async () => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
  ctx.option = {
    ...env.addCmdOption,
    ...getResolvedPaths({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      output: path.join(originPath, 'examples'),
    }),
    generatorOptionObject: await getSchemaGeneratorOption({
      discriminator: 'add-schema',
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      generatorOption: undefined,
      skipError: env.addCmdOption.skipError,
    }),
  };
  ctx.generatorOption = ctx.option.generatorOptionObject;
  ctx.generator = tjsg.createGenerator({
    ...ctx.option.generatorOptionObject,
    type: '*',
  });

  data.exit = jest.spyOn(process, 'exit').mockImplementationOnce((_code?: number | undefined) => {
    throw new Error('Exit triggered');
  });

  data.send = jest.spyOn(process, 'send').mockImplementationOnce((_data: unknown) => {
    return true;
  });
});

afterEach(() => {
  if (data.exit != null) {
    data.exit.mockRestore();
  }

  if (data.send != null) {
    data.send.mockRestore();
  }
});

describe('WorkEmitter - watch', () => {
  test('add', async () => {
    const w = new NozzleEmitter({ context: ctx });

    await w.watchSourceFileAdd({
      kind: CE_WATCH_EVENT.ADD,
      filePath: path.join(ctx.option.cwd, 'IStudentDto.ts'),
    });

    w.emit(CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD, {
      kind: CE_WATCH_EVENT.ADD,
      filePath: path.join(ctx.option.cwd, 'IStudentDto.ts'),
    });
  });

  test('add - exception', async () => {
    try {
      const w = new NozzleEmitter({ context: ctx });

      await w.watchSourceFileAdd({
        kind: CE_WATCH_EVENT.ADD,
        filePath: '',
      });
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('change', async () => {
    const w = new NozzleEmitter({ context: ctx });

    await w.watchSourceFileChange({
      kind: CE_WATCH_EVENT.CHANGE,
      filePath: path.join(ctx.option.cwd, 'IStudentDto.ts'),
    });

    w.emit(CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE, {
      kind: CE_WATCH_EVENT.CHANGE,
      filePath: path.join(ctx.option.cwd, 'IStudentDto.ts'),
    });
  });

  test('change - not found', async () => {
    try {
      const w = new NozzleEmitter({ context: ctx });

      await w.watchSourceFileChange({
        kind: CE_WATCH_EVENT.CHANGE,
        filePath: 'asdf',
      });
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('change - exception', async () => {
    const w = new NozzleEmitter({ context: ctx });
    const spy = jest.spyOn(ctx.project, 'getSourceFile').mockImplementationOnce(() => {
      throw new Error('error deliberate raise');
    });

    try {
      await w.watchSourceFileChange({
        kind: CE_WATCH_EVENT.CHANGE,
        filePath: '',
      });
    } catch (caught) {
      spy.mockRestore();
      expect(caught).toBeDefined();
    }
  });

  test('unlink', async () => {
    const w = new NozzleEmitter({ context: ctx });

    await w.watchSourceFileUnlink({
      kind: CE_WATCH_EVENT.UNLINK,
      filePath: path.join(ctx.option.cwd, 'IStudentDto.ts'),
    });

    w.emit(CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK, {
      kind: CE_WATCH_EVENT.UNLINK,
      filePath: path.join(ctx.option.cwd, 'IStudentDto.ts'),
    });
  });

  test('unlink - not found', async () => {
    try {
      const w = new NozzleEmitter({ context: ctx });

      await w.watchSourceFileUnlink({
        kind: CE_WATCH_EVENT.UNLINK,
        filePath: '',
      });
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('unlink - exception', async () => {
    const w = new NozzleEmitter({ context: ctx });
    const spy = jest.spyOn(ctx.project, 'getSourceFile').mockImplementationOnce(() => {
      throw new Error('error deliberate raise');
    });

    try {
      await w.watchSourceFileUnlink({
        kind: CE_WATCH_EVENT.UNLINK,
        filePath: '',
      });
    } catch (caught) {
      spy.mockRestore();
      expect(caught).toBeDefined();
    }
  });

  test('watchSourceEventFileSummary', async () => {
    const w = new NozzleEmitter({ context: ctx });

    await w.watchSourceEventFileSummary({
      filePaths: ['a', 'b', 'c'],
    });
  });

  test('watchSourceEventFileSummary', async () => {
    const w = new NozzleEmitter({ context: ctx });
    w.emit(CE_WORKER_ACTION.WATCH_SOURCE_EVENT_FILE_SUMMARY, {
      filePaths: ['a', 'b', 'c'],
    });
  });

  test('watchSourceEventFileSummary - exception', async () => {
    const w = new NozzleEmitter({ context: ctx });
    const spy = jest.spyOn(ctx.project, 'getSourceFile').mockImplementationOnce(() => {
      throw new Error('error deliberate raise');
    });

    try {
      await w.watchSourceEventFileSummary({
        filePaths: ['a', 'b', 'c'],
      });
    } catch (caught) {
      spy.mockRestore();
      expect(caught).toBeDefined();
    }
  });
});
