import getResolvedPaths from '#configs/getResolvedPaths';
import * as env from '#modules/__tests__/env';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type TMasterToWorkerMessage from '#workers/interfaces/TMasterToWorkerMessage';
import NozzleEmitter from '#workers/NozzleEmitter';
import 'jest';

const compilerOptions = {
  lib: ['lib.es2021.d.ts', 'lib.dom.d.ts'],
  module: 1,
  target: 7,
  strict: true,
  esModuleInterop: true,
  skipLibCheck: true,
  forceConsistentCasingInFileNames: true,
  moduleResolution: 2,
  composite: true,
  declaration: true,
  declarationMap: true,
  sourceMap: true,
  removeComments: true,
  noImplicitAny: false,
  importHelpers: false,
  noImplicitReturns: true,
  noFallthroughCasesInSwitch: true,
  isolatedModules: true,
  allowJs: true,
  paths: {
    '#cli/*': ['src/cli/*'],
    '#compilers/*': ['src/compilers/*'],
    '#commands/*': ['src/commands/*'],
    '#configs/*': ['src/configs/*'],
    '#databases/*': ['src/databases/*'],
    '#errors/*': ['src/errors/*'],
    '#modules/*': ['src/modules/*'],
    '#tools/*': ['src/tools/*'],
    '#workers/*': ['src/workers/*'],
  },
  allowSyntheticDefaultImports: true,
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  pretty: true,
};

let reply: unknown;

beforeEach(() => {
  jest.spyOn(process, 'exit').mockImplementation((code?: number | undefined) => {
    console.log(code);
    throw new Error('Exit triggered');
  });

  jest.spyOn(process, 'send').mockImplementation((data: unknown) => {
    reply = data;
    console.log('process.send: ', reply);
    return true;
  });
});

describe('WorkEmitter', () => {
  test('pass', async () => {
    const w = new NozzleEmitter();
    const resolvedPaths = getResolvedPaths(env.baseOption);

    w.emit(CE_WORKER_ACTION.OPTION_LOAD, {
      command: CE_WORKER_ACTION.OPTION_LOAD,
      data: { option: env.addCmdOption, resolvedPaths },
    } satisfies Exclude<TMasterToWorkerMessage, typeof CE_WORKER_ACTION.OPTION_LOAD>);
  });

  test('pass', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption };

    await w.loadProject();
    console.log(w.project?.compilerOptions.get());
    expect(w.project?.compilerOptions.get()).toMatchObject(compilerOptions);
  });

  test('pass - 2', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption };

    w.emit(CE_WORKER_ACTION.PROJECT_LOAD);
  });

  test('fail', async () => {
    try {
      const w = new NozzleEmitter();
      w.option = { ...env.addCmdOption };
      w.option.project = '';

      await w.loadProject();
    } catch (catched) {
      expect(catched).toBeDefined();
    }
  });

  test('fail - 2', async () => {
    try {
      const w = new NozzleEmitter();
      w.option = { ...env.addCmdOption };
      w.option.project = '';

      w.emit(CE_WORKER_ACTION.PROJECT_LOAD);
    } catch (catched) {
      expect(catched).toBeDefined();
    }
  });

  test('fail - 3', async () => {
    try {
      const w = new NozzleEmitter();
      await w.loadProject();
    } catch (catched) {
      expect(catched).toBeDefined();
    }
  });

  test('terminate', () => {
    try {
      NozzleEmitter.terminate(0);
    } catch (catched) {
      expect(catched).toBeDefined();
    }
  });

  test('terminate - undefined', () => {
    try {
      NozzleEmitter.terminate();
    } catch (catched) {
      expect(catched).toBeDefined();
    }
  });

  test('terminate - emit', () => {
    try {
      const w = new NozzleEmitter();
      w.emit(CE_WORKER_ACTION.TERMINATE);
    } catch (catched) {
      expect(catched).toBeDefined();
    }
  });

  test('working', () => {
    const w = new NozzleEmitter();
    w.working({ command: CE_WORKER_ACTION.NOOP, data: undefined });
  });

  test('diagonostic', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption };

    await w.loadProject();
    await w.diagonostic();
  });

  test('diagonostic - fail', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption };
    w.option.project = '';

    w.emit(CE_WORKER_ACTION.PROJECT_DIAGOSTIC);
  });

  test('diagonostic - exception', async () => {
    try {
      const w = new NozzleEmitter();
      w.option = { ...env.addCmdOption };

      jest.spyOn(w, 'diagonostic').mockImplementation(async () => {
        throw new Error('mock error raised');
      });

      await w.loadProject();

      w.option.skipError = false;
      w.project?.createSourceFile('t.ts', 'const a = "1"; a = 3');

      w.emit(CE_WORKER_ACTION.PROJECT_DIAGOSTIC);
    } catch (catched) {
      expect(catched).toBeDefined();
    }
  });

  test('diagonostic - skipError false', async () => {
    try {
      const w = new NozzleEmitter();
      w.option = { ...env.addCmdOption };

      await w.loadProject();

      w.option.skipError = false;
      w.project?.createSourceFile('t.ts', 'const a = "1"; a = 3');

      w.emit(CE_WORKER_ACTION.PROJECT_DIAGOSTIC);
    } catch (catched) {
      expect(catched).toBeDefined();
    }
  });
});