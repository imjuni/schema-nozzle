import getResolvedPaths from '#configs/getResolvedPaths';
import getSchemaGeneratorOption from '#configs/getSchemaGeneratorOption';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import { CE_WATCH_EVENT } from '#modules/interfaces/CE_WATCH_EVENT';
import * as env from '#modules/__tests__/env';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import NozzleEmitter from '#workers/NozzleEmitter';
import 'jest';
import path from 'path';
import * as tsm from 'ts-morph';

const originPath = process.env.INIT_CWD!;
const data: {
  resolvedPaths: ReturnType<typeof getResolvedPaths>;
  project: tsm.Project;
  option: TAddSchemaOption;
} = {} as any;

beforeAll(async () => {
  data.project = new tsm.Project({
    tsConfigFilePath: path.join(originPath, 'examples', 'tsconfig.json'),
  });
  data.option = {
    ...env.addCmdOption,
    ...data.resolvedPaths,
  };
  data.option.generatorOptionObject = await getSchemaGeneratorOption(data.option);
});

beforeEach(() => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
  data.resolvedPaths = getResolvedPaths({
    project: path.join(originPath, 'examples', 'tsconfig.json'),
    output: path.join(originPath, 'examples'),
  });

  data.option = {
    ...data.option,
    ...data.resolvedPaths,
  };

  jest.clearAllMocks();
});

describe('WorkEmitter - watch', () => {
  test('add', async () => {
    const w = new NozzleEmitter();
    w.loadOption({ option: data.option });
    w.project = data.project;

    await w.watchSourceFileAdd({
      kind: CE_WATCH_EVENT.ADD,
      filePath: path.join(w.option!.cwd, 'IStudentDto.ts'),
    });

    w.emit(CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD, {
      kind: CE_WATCH_EVENT.ADD,
      filePath: path.join(w.option!.cwd, 'IStudentDto.ts'),
    });
  });

  test('add - exception', async () => {
    try {
      jest.spyOn(process, 'exit').mockImplementationOnce((_code?: number | undefined) => {
        throw new Error('Exit triggered');
      });

      jest.spyOn(process, 'send').mockImplementationOnce((_data: unknown) => {
        return true;
      });

      const w = new NozzleEmitter();
      w.loadOption({ option: data.option });
      w.project = data.project;

      await w.watchSourceFileAdd({
        kind: CE_WATCH_EVENT.ADD,
        filePath: '',
      });
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('change', async () => {
    const w = new NozzleEmitter();
    w.loadOption({ option: data.option });
    w.project = data.project;

    await w.watchSourceFileChange({
      kind: CE_WATCH_EVENT.CHANGE,
      filePath: path.join(data.option.cwd, 'IStudentDto.ts'),
    });

    w.emit(CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE, {
      kind: CE_WATCH_EVENT.CHANGE,
      filePath: path.join(data.option.cwd, 'IStudentDto.ts'),
    });
  });

  test('change - not found', async () => {
    try {
      jest.spyOn(process, 'exit').mockImplementationOnce((_code?: number | undefined) => {
        throw new Error('Exit triggered');
      });

      jest.spyOn(process, 'send').mockImplementationOnce((_data: unknown) => {
        return true;
      });

      const w = new NozzleEmitter();
      w.loadOption({ option: data.option });
      w.project = data.project;

      await w.watchSourceFileChange({
        kind: CE_WATCH_EVENT.CHANGE,
        filePath: 'asdf',
      });
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('change - exception', async () => {
    try {
      const w = new NozzleEmitter();
      w.loadOption({ option: data.option });
      w.project = data.project;

      jest.spyOn(process, 'exit').mockImplementationOnce((_code?: number | undefined) => {
        throw new Error('Exit triggered');
      });

      jest.spyOn(process, 'send').mockImplementationOnce((_data: unknown) => {
        return true;
      });

      jest.spyOn(w.project, 'getSourceFile').mockImplementationOnce(() => {
        throw new Error('error deliberate raise');
      });

      await w.watchSourceFileChange({
        kind: CE_WATCH_EVENT.CHANGE,
        filePath: '',
      });
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('unlink', async () => {
    const w = new NozzleEmitter();
    w.loadOption({ option: data.option });
    w.project = data.project;

    await w.watchSourceFileUnlink({
      kind: CE_WATCH_EVENT.UNLINK,
      filePath: path.join(data.option.cwd, 'IStudentDto.ts'),
    });

    w.emit(CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK, {
      kind: CE_WATCH_EVENT.UNLINK,
      filePath: path.join(data.option.cwd, 'IStudentDto.ts'),
    });
  });

  test('unlink - not found', async () => {
    try {
      const w = new NozzleEmitter();
      w.loadOption({ option: data.option });
      w.project = data.project;

      jest.spyOn(process, 'exit').mockImplementationOnce((_code?: number | undefined) => {
        throw new Error('Exit triggered');
      });

      jest.spyOn(process, 'send').mockImplementationOnce((_data: unknown) => {
        return true;
      });

      await w.watchSourceFileUnlink({
        kind: CE_WATCH_EVENT.UNLINK,
        filePath: '',
      });
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('unlink - exception', async () => {
    try {
      const w = new NozzleEmitter();
      w.loadOption({ option: data.option });
      w.project = data.project;

      jest.spyOn(process, 'exit').mockImplementationOnce((_code?: number | undefined) => {
        throw new Error('Exit triggered');
      });

      jest.spyOn(process, 'send').mockImplementationOnce((_data: unknown) => {
        return true;
      });

      jest.spyOn(w.project, 'getSourceFile').mockImplementationOnce(() => {
        throw new Error('error deliberate raise');
      });

      await w.watchSourceFileUnlink({
        kind: CE_WATCH_EVENT.UNLINK,
        filePath: '',
      });
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });
});
