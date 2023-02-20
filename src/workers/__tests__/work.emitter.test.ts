import getResolvedPaths from '#configs/getResolvedPaths';
import * as odb from '#databases/openDatabase';
import * as ffp from '#modules/getSchemaFilterFilePath';
import type IDatabaseItem from '#modules/interfaces/IDatabaseItem';
import * as env from '#modules/__tests__/env';
import getData from '#tools/__tests__/test-tools/getData';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type TMasterToWorkerMessage from '#workers/interfaces/TMasterToWorkerMessage';
import type { TPickMasterToWorkerMessage } from '#workers/interfaces/TMasterToWorkerMessage';
import NozzleEmitter from '#workers/NozzleEmitter';
import 'jest';
import path from 'path';
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

describe('WorkEmitter - project', () => {
  test('pass', async () => {
    const w = new NozzleEmitter();

    w.emit(CE_WORKER_ACTION.OPTION_LOAD, {
      command: CE_WORKER_ACTION.OPTION_LOAD,
      data: { option: { ...env.addCmdOption, ...data.resolvedPaths } },
    } satisfies Exclude<TMasterToWorkerMessage, typeof CE_WORKER_ACTION.OPTION_LOAD>);
  });

  test('load project - direct call', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };
    w.project = data.project;

    expect(w.project.compilerOptions.get()).toMatchObject(compilerOptions);
  });

  test('pass - 2', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };

    w.emit(CE_WORKER_ACTION.PROJECT_LOAD);
  });

  test('fail', async () => {
    try {
      const w = new NozzleEmitter();
      w.option = { ...env.addCmdOption, ...data.resolvedPaths };
      w.option.project = '';

      await w.loadProject();
    } catch (caught) {
      expect(caught).toBeDefined();
    }
  });

  test('fail - 2', async () => {
    try {
      const w = new NozzleEmitter();
      w.option = { ...env.addCmdOption, ...data.resolvedPaths };
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
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };
    w.project = data.project;

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
      w.option = { ...env.addCmdOption };

      await w.loadProject();

      w.option.skipError = false;
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
    w.option = { ...env.addCmdOption };
    w.project = data.project;

    const fine = w.check(CE_WORKER_ACTION.CREATE_JSON_SCHEMA, 'test');
    expect(fine.option).toMatchObject(env.addCmdOption);
  });

  test('check - exception', async () => {
    try {
      const w = new NozzleEmitter();
      w.option = { ...env.addCmdOption };
      w.check(CE_WORKER_ACTION.CREATE_JSON_SCHEMA, 'test');
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test('generatorOptionLoad', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };
    w.project = data.project;
    await w.generatorOptionLoad();

    jest.spyOn(w, 'generatorOptionLoad').mockImplementationOnce(() => Promise.reject());
    w.emit(CE_WORKER_ACTION.GENERATOR_OPTION_LOAD);
  });
});

describe('WorkEmitter - schema', () => {
  test('summarySchemaFiles', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };
    w.project = data.project;
    await w.workerSummarySchemaFiles();

    jest.spyOn(w, 'workerSummarySchemaFiles').mockImplementationOnce(() => Promise.reject());
    w.emit(CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES);
  });

  test('summarySchemaTypes', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };
    w.project = data.project;
    await w.workerSummarySchemaTypes();

    jest.spyOn(w, 'workerSummarySchemaTypes').mockImplementationOnce(() => Promise.reject());
    w.emit(CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES);
  });

  test('summarySchemaFileType', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };
    w.project = data.project;
    await w.workerSummarySchemaFileType();

    jest.spyOn(w, 'workerSummarySchemaFileType').mockImplementationOnce(() => Promise.reject());
    w.emit(CE_WORKER_ACTION.SUMMARY_SCHEMA_FILE_TYPE);
  });

  test('loadDatabase', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };
    w.project = data.project;
    await w.loadDatabase();

    jest.spyOn(w, 'loadDatabase').mockImplementationOnce(() => Promise.reject());
    w.emit(CE_WORKER_ACTION.LOAD_DATABASE);
  });

  test('loadDatabase - exception', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };

    jest.spyOn(ffp, 'default').mockImplementationOnce(() => Promise.resolve(undefined));
    jest.spyOn(odb, 'default').mockImplementationOnce(() => Promise.resolve({}));

    w.project = data.project;
    await w.loadDatabase();
  });

  test('loadDatabase - db', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };
    const dbData = await getData<Record<string, IDatabaseItem>>(
      path.join(__dirname, 'data/001.json'),
    );

    jest.spyOn(ffp, 'default').mockImplementationOnce(() => Promise.resolve(undefined));
    jest.spyOn(odb, 'default').mockImplementationOnce(() => Promise.resolve(dbData));

    w.project = data.project;
    await w.loadDatabase();
  });

  test('createJsonSchema', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };
    w.project = data.project;
    await w.generatorOptionLoad();
    await w.createJsonSchema({
      filePath: path.join(w.option.cwd, 'IProfessorDto.ts'),
      exportedType: 'IProfessorDto',
    });

    const payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA>['data'] =
      {
        filePath: path.join(w.option.cwd, 'IProfessorDto.ts'),
        exportedType: 'IProfessorDto',
      };
    w.emit(CE_WORKER_ACTION.CREATE_JSON_SCHEMA, payload);

    jest.spyOn(w, 'createJsonSchema').mockImplementationOnce(() => Promise.reject());
    w.emit(CE_WORKER_ACTION.CREATE_JSON_SCHEMA, payload);
  });

  test('createJsonSchema', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };
    w.project = data.project;
    await w.generatorOptionLoad();
    await w.createJsonSchema({
      filePath: path.join(w.option.cwd, 'CE_MAJOR.ts'),
      exportedType: 'CE_MAJOR',
    });
  });

  test('createJsonSchema - fail', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };
    w.project = data.project;

    await w.generatorOptionLoad();
    await w.createJsonSchema({
      filePath: path.join(w.option.cwd, 'IProfessorDto.ts'),
      exportedType: 'IProfessorDto33',
    });
  });

  test('createJsonSchemaBulk', async () => {
    const w = new NozzleEmitter();
    w.option = { ...env.addCmdOption, ...data.resolvedPaths };
    w.project = data.project;

    await w.generatorOptionLoad();
    await w.createJsonSchemaBulk([
      {
        filePath: path.join(w.option.cwd, 'IReqReadStudentDto.ts'),
        exportedType: 'IReqReadStudentQuerystring',
      },
      {
        filePath: path.join(w.option.cwd, 'IReqReadStudentDto.ts'),
        exportedType: 'IReqReadStudentParam',
      },
      {
        filePath: path.join(w.option.cwd, 'IReqReadStudentDto.ts'),
        exportedType: 'IReqReadStudentParam33',
      },
    ]);

    const payload: TPickMasterToWorkerMessage<
      typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK
    >['data'] = [
      {
        filePath: path.join(w.option.cwd, 'IProfessorDto.ts'),
        exportedType: 'IProfessorDto',
      },
    ];
    jest.spyOn(w, 'createJsonSchemaBulk').mockImplementationOnce(() => Promise.reject());
    w.emit(CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK, payload);
  });
});
