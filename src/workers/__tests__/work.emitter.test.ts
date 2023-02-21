import getResolvedPaths from '#configs/getResolvedPaths';
import getSchemaGeneratorOption from '#configs/getSchemaGeneratorOption';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import * as env from '#modules/__tests__/env';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type { TPickMasterToWorkerMessage } from '#workers/interfaces/TMasterToWorkerMessage';
import NozzleEmitter from '#workers/NozzleEmitter';
import 'jest';
import path from 'path';
import * as tjsg from 'ts-json-schema-generator';
import * as tsm from 'ts-morph';

const compilerOptions = {
  lib: ['lib.es2021.d.ts', 'lib.dom.d.ts'],
  module: 1,
  target: 7,
  strict: true,
  esModuleInterop: true,
  skipLibCheck: true,
  forceConsistentCasingInFileNames: true,
  moduleResolution: 2,
  declaration: true,
  composite: true,
  incremental: true,
  declarationMap: true,
  sourceMap: true,
  removeComments: true,
  noImplicitAny: false,
  importHelpers: false,
  noImplicitReturns: true,
  noFallthroughCasesInSwitch: true,
  isolatedModules: true,
  allowSyntheticDefaultImports: true,
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  pretty: true,
};

const originPath = process.env.INIT_CWD!;
const data: {
  resolvedPaths: ReturnType<typeof getResolvedPaths>;
  project: tsm.Project;
  option: TAddSchemaOption;
  generator: tjsg.SchemaGenerator;
} = {} as any;

beforeAll(async () => {
  data.project = new tsm.Project({
    tsConfigFilePath: path.join(originPath, 'examples', 'tsconfig.json'),
  });
  data.option = {
    ...env.addCmdOption,
  };
  data.option.generatorOptionObject = await getSchemaGeneratorOption(data.option);
  data.generator = tjsg.createGenerator({
    ...data.option.generatorOptionObject,
    path: path.join(originPath, 'examples', 'CE_MAJOR.ts'),
    type: '*',
  });
});

beforeEach(() => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
  data.resolvedPaths = getResolvedPaths({
    project: path.join(originPath, 'examples', 'tsconfig.json'),
    output: path.join(originPath, 'examples'),
  });
  data.option = { ...data.option, ...data.resolvedPaths };

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

describe('WorkEmitter - project', () => {
  test('pass - option load emit', async () => {
    const w = new NozzleEmitter();

    w.emit(CE_WORKER_ACTION.OPTION_LOAD, {
      option: data.option,
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.OPTION_LOAD>['data']);
  });

  test('load project - direct call', async () => {
    const w = new NozzleEmitter();
    w.option = data.option;
    w.project = data.project;

    expect(w.project.compilerOptions.get()).toMatchObject(compilerOptions);
  });

  test('pass - project emit', async () => {
    const w = new NozzleEmitter();
    w.option = data.option;

    w.emit(CE_WORKER_ACTION.PROJECT_LOAD);
  });

  test('fail', async () => {
    try {
      const w = new NozzleEmitter();
      w.option = data.option;
      w.option.project = '';

      await w.loadProject();
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('fail - 2', async () => {
    try {
      const w = new NozzleEmitter();
      w.option = data.option;
      w.option.project = '';

      w.emit(CE_WORKER_ACTION.PROJECT_LOAD);
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('fail - 3', async () => {
    try {
      const w = new NozzleEmitter();
      await w.loadProject();
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('working', () => {
    const w = new NozzleEmitter();
    w.working({ command: CE_WORKER_ACTION.NOOP });
  });

  test('diagonostic', async () => {
    const w = new NozzleEmitter();
    w.project = data.project;
    w.loadOption({ option: data.option });

    await w.diagonostic();
  });

  test('diagonostic - exception', async () => {
    try {
      const w = new NozzleEmitter();
      w.option = { ...env.addCmdOption };

      jest.spyOn(w, 'diagonostic').mockImplementationOnce(async () => {
        throw new Error('mock error raised');
      });

      await w.loadProject();

      w.option.skipError = false;
      w.project?.createSourceFile('t.ts', 'const a = "1"; a = 3');

      w.emit(CE_WORKER_ACTION.PROJECT_DIAGONOSTIC);
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('diagonostic - skipError false', async () => {
    try {
      const w = new NozzleEmitter();
      w.loadOption({ option: data.option });

      await w.loadProject();

      w.option!.skipError = false;
      w.project?.createSourceFile('t.ts', 'const a = "1"; a = 3');

      w.emit(CE_WORKER_ACTION.PROJECT_DIAGONOSTIC);
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });
});

describe('WorkEmitter - option', () => {
  test('check', async () => {
    const w = new NozzleEmitter();
    w.project = data.project;
    w.loadOption({ option: data.option });

    const fine = w.check(CE_WORKER_ACTION.CREATE_JSON_SCHEMA, 'test');
    expect(fine.option).toMatchObject(data.option);
  });

  test('check - exception', async () => {
    try {
      const w = new NozzleEmitter();
      w.loadOption({ option: data.option });

      w.check(CE_WORKER_ACTION.CREATE_JSON_SCHEMA, 'test');
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
