import getResolvedPaths from '#configs/getResolvedPaths';
import getSchemaGeneratorOption from '#configs/getSchemaGeneratorOption';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import * as odb from '#databases/openDatabase';
import * as ffp from '#modules/getSchemaFilterFilePath';
import type IDatabaseItem from '#modules/interfaces/IDatabaseItem';
import * as env from '#modules/__tests__/env';
import getData from '#tools/__tests__/test-tools/getData';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type { TPickMasterToWorkerMessage } from '#workers/interfaces/TMasterToWorkerMessage';
import NozzleEmitter from '#workers/NozzleEmitter';
import 'jest';
import path from 'path';
import * as tjsg from 'ts-json-schema-generator';
import * as tsm from 'ts-morph';

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

describe('WorkEmitter - schema', () => {
  test('summarySchemaFiles', async () => {
    const w = new NozzleEmitter();
    w.project = data.project;
    w.loadOption({ option: data.option });

    await w.workerSummarySchemaFiles();

    jest.spyOn(w, 'workerSummarySchemaFiles').mockImplementationOnce(() => Promise.reject());
    w.emit(CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES);
  });

  test('summarySchemaTypes', async () => {
    const w = new NozzleEmitter();
    w.project = data.project;
    w.loadOption({ option: data.option });

    await w.workerSummarySchemaTypes();

    jest.spyOn(w, 'workerSummarySchemaTypes').mockImplementationOnce(() => Promise.reject());
    w.emit(CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES);
  });

  test('summarySchemaFileType', async () => {
    const w = new NozzleEmitter();
    w.loadOption({ option: data.option });
    w.project = data.project;

    await w.workerSummarySchemaFileType();

    jest.spyOn(w, 'workerSummarySchemaFileType').mockImplementationOnce(() => Promise.reject());
    w.emit(CE_WORKER_ACTION.SUMMARY_SCHEMA_FILE_TYPE);
  });

  test('loadDatabase', async () => {
    const w = new NozzleEmitter();
    w.loadOption({ option: data.option });
    w.project = data.project;
    await w.loadDatabase();

    jest.spyOn(w, 'loadDatabase').mockImplementationOnce(() => Promise.reject());
    w.emit(CE_WORKER_ACTION.LOAD_DATABASE);
  });

  test('loadDatabase - exception', async () => {
    const w = new NozzleEmitter();
    w.loadOption({ option: data.option });

    jest.spyOn(ffp, 'default').mockImplementationOnce(() => Promise.resolve(undefined));
    jest.spyOn(odb, 'default').mockImplementationOnce(() => Promise.resolve({}));

    w.project = data.project;
    await w.loadDatabase();
  });

  test('loadDatabase - db', async () => {
    const w = new NozzleEmitter();
    w.loadOption({ option: data.option });
    const dbData = await getData<Record<string, IDatabaseItem>>(
      path.join(__dirname, 'data/001.json'),
    );

    jest.spyOn(ffp, 'default').mockImplementationOnce(() => Promise.resolve(undefined));
    jest.spyOn(odb, 'default').mockImplementationOnce(() => Promise.resolve(dbData));

    w.project = data.project;
    await w.loadDatabase();
  });

  test('createJsonSchema - mapped access + call', async () => {
    const w = new NozzleEmitter();
    w.project = data.project;
    w.loadOption({ option: data.option });

    await w.createJsonSchema({
      filePath: path.join(w.option!.cwd, 'IProfessorDto.ts'),
      exportedType: 'IProfessorDto',
    });
  });

  test('createJsonSchema - mapped access - call', async () => {
    const w = new NozzleEmitter({ generator: data.generator });
    w.project = data.project;
    w.loadOption({ option: data.option });

    await w.createJsonSchema({
      filePath: path.join(w.option!.cwd, 'IProfessorDto.ts'),
      exportedType: 'IProfessorDto',
    });
  });

  test('createJsonSchema - with root type + emit', async () => {
    const w = new NozzleEmitter();
    w.project = data.project;
    w.loadOption({ option: data.option });

    const payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA>['data'] =
      {
        filePath: path.join(data.option.cwd, 'IReqReadStudentDto.ts'),
        exportedType: 'IReqReadStudentQuerystring',
      };
    w.emit(CE_WORKER_ACTION.CREATE_JSON_SCHEMA, payload);
  });

  test('createJsonSchema - with root type + emit exception', async () => {
    const w = new NozzleEmitter();
    w.project = data.project;
    w.loadOption({ option: data.option });

    const payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA>['data'] =
      {
        filePath: path.join(w.option!.cwd, 'IProfessorDto.ts'),
        exportedType: 'IProfessorDto',
      };

    jest.spyOn(w, 'createJsonSchema').mockImplementationOnce(() => Promise.reject());
    w.emit(CE_WORKER_ACTION.CREATE_JSON_SCHEMA, payload);
  });

  test('createJsonSchema without root type', async () => {
    const w = new NozzleEmitter();
    w.loadOption({ option: data.option });
    w.project = data.project;

    await w.createJsonSchema({
      filePath: path.join(w.option!.cwd, 'CE_MAJOR.ts'),
      exportedType: 'CE_MAJOR',
    });
  });

  test('createJsonSchema - fail', async () => {
    const w = new NozzleEmitter();
    w.project = data.project;
    w.loadOption({ option: data.option });

    await w.createJsonSchema({
      filePath: path.join(w.option!.cwd, 'IProfessorDto.ts'),
      exportedType: 'IProfessorDto33',
    });
  });

  test('createJsonSchemaBulk - call', async () => {
    const w = new NozzleEmitter({ generator: data.generator });
    w.loadOption({ option: data.option });
    w.project = data.project;

    await w.createJsonSchemaBulk([
      {
        filePath: path.join(data.option.cwd, 'IReqReadStudentDto.ts'),
        exportedType: 'IReqReadStudentQuerystring',
      },
      {
        filePath: path.join(data.option.cwd, 'IReqReadStudentDto.ts'),
        exportedType: 'IReqReadStudentParam',
      },
    ]);
  });

  test('createJsonSchemaBulk - emit', async () => {
    const w = new NozzleEmitter();
    w.loadOption({ option: data.option });
    w.project = data.project;

    const payload: TPickMasterToWorkerMessage<
      typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK
    >['data'] = [
      {
        filePath: path.join(data.option.cwd, 'IReqReadStudentDto.ts'),
        exportedType: 'IReqReadStudentParam',
      },
      {
        filePath: path.join(data.option.cwd, 'IReqReadStudentDto.ts'),
        exportedType: 'IReqReadStudentQuerystring',
      },
      {
        filePath: path.join(w.option!.cwd, 'IProfessorDto.ts'),
        exportedType: 'IProfessorDto',
      },
    ];

    w.emit(CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK, payload);
  });

  test('createJsonSchemaBulk - call either fail', async () => {
    const w = new NozzleEmitter();
    w.loadOption({ option: data.option });
    w.project = data.project;

    await w.createJsonSchemaBulk([
      {
        filePath: path.join(data.option.cwd, 'IProfessorDto_raise_fail.ts'),
        exportedType: 'IProfessorDto',
      },
    ]);
  });
});
