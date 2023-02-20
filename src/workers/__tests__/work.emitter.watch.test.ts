import getResolvedPaths from '#configs/getResolvedPaths';
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
} = {} as any;

beforeAll(() => {
  data.project = new tsm.Project({
    tsConfigFilePath: path.join(originPath, 'examples', 'tsconfig.json'),
  });
});

beforeEach(() => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
  data.resolvedPaths = getResolvedPaths({
    project: path.join(originPath, 'examples', 'tsconfig.json'),
    output: path.join(originPath, 'examples'),
  });

  jest.spyOn(process, 'exit').mockImplementationOnce((_code?: number | undefined) => {
    throw new Error('Exit triggered');
  });

  jest.spyOn(process, 'send').mockImplementationOnce((_data: unknown) => {
    return true;
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('WorkEmitter - watch', () => {
  test('add', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };
    w.project = data.project;

    await w.watchSourceFileAdd({
      kind: CE_WATCH_EVENT.ADD,
      filePath: path.join(w.option.cwd, 'IStudentDto.ts'),
    });

    w.emit(CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD, {
      kind: CE_WATCH_EVENT.ADD,
      filePath: path.join(w.option.cwd, 'IStudentDto.ts'),
    });
  });

  test('add - exception', async () => {
    try {
      const w = new NozzleEmitter();
      w.option = { ...env.addCmdOption, ...data.resolvedPaths };
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
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };
    w.project = data.project;

    await w.watchSourceFileChange({
      kind: CE_WATCH_EVENT.CHANGE,
      filePath: path.join(w.option.cwd, 'IStudentDto.ts'),
    });

    w.emit(CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE, {
      kind: CE_WATCH_EVENT.CHANGE,
      filePath: path.join(w.option.cwd, 'IStudentDto.ts'),
    });
  });

  test('change - not found', async () => {
    try {
      const w = new NozzleEmitter();
      w.option = { ...env.addCmdOption, ...data.resolvedPaths };
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
      w.option = { ...env.addCmdOption, ...data.resolvedPaths };
      w.project = data.project;

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
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };
    w.project = data.project;

    await w.watchSourceFileUnlink({
      kind: CE_WATCH_EVENT.UNLINK,
      filePath: path.join(w.option.cwd, 'IStudentDto.ts'),
    });

    w.emit(CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK, {
      kind: CE_WATCH_EVENT.UNLINK,
      filePath: path.join(w.option.cwd, 'IStudentDto.ts'),
    });
  });

  test('unlink - not found', async () => {
    try {
      const w = new NozzleEmitter();
      w.option = { ...env.addCmdOption, ...data.resolvedPaths };
      w.project = data.project;

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
      w.option = { ...env.addCmdOption, ...data.resolvedPaths };
      w.project = data.project;

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
