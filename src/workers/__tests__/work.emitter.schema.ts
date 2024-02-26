import { getResolvedPaths } from '#/configs/getResolvedPaths';
import { getSchemaGeneratorOption } from '#/configs/getSchemaGeneratorOption';
import * as odb from '#/databases/openDatabase';
import * as env from '#/modules/__tests__/env';
import * as ffp from '#/modules/getSchemaFilterFilePath';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import { getData } from '#/tools/__tests__/test-tools/getData';
import { NozzleContext } from '#/workers/NozzleContext';
import { NozzleEmitter } from '#/workers/NozzleEmitter';
import { CE_WORKER_ACTION } from '#/workers/interfaces/CE_WORKER_ACTION';
import type { TPickMasterToWorkerMessage } from '#/workers/interfaces/TMasterToWorkerMessage';
import path from 'path';
import { createGenerator } from 'ts-json-schema-generator';
import * as tsm from 'ts-morph';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vitest,
  type MockInstance,
} from 'vitest';

const originPath = process.cwd();
process.env.USE_INIT_CWD = 'true';
process.env.INIT_CWD = path.join(originPath, 'examples');
const ctx = new NozzleContext();
const data: {
  exit: MockInstance<any, any> | MockInstance<any, never> | undefined;
  send: MockInstance<any, any> | undefined;
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
  ctx.generator = createGenerator({
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
  ctx.generator = createGenerator({
    ...ctx.option.generatorOptionObject,
    type: '*',
  });

  data.exit = vitest.spyOn(process, 'exit').mockImplementationOnce((_code?: number | undefined) => {
    throw new Error('Exit triggered');
  });

  data.send = vitest.spyOn(process, 'send').mockImplementationOnce((_data: unknown) => {
    return true;
  });
});

afterEach(() => {
  vitest.clearAllMocks();
});

describe('WorkEmitter - summary', () => {
  it('summarySchemaFiles', async () => {
    const w = new NozzleEmitter({ context: ctx });

    await w.workerSummarySchemaFiles();

    vitest.spyOn(w, 'workerSummarySchemaFiles').mockImplementationOnce(() => Promise.reject());
    w.emit(CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES);
  });

  it('summarySchemaTypes', async () => {
    const w = new NozzleEmitter({ context: ctx });

    await w.workerSummarySchemaTypes();

    vitest.spyOn(w, 'workerSummarySchemaTypes').mockImplementationOnce(() => Promise.reject());
    w.emit(CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES);
  });

  it('summarySchemaFileType', async () => {
    const w = new NozzleEmitter({ context: ctx });

    await w.workerSummarySchemaFileType();

    vitest.spyOn(w, 'workerSummarySchemaFileType').mockImplementationOnce(() => Promise.reject());
    w.emit(CE_WORKER_ACTION.SUMMARY_SCHEMA_FILE_TYPE);
  });

  it('loadDatabase', async () => {
    const w = new NozzleEmitter({ context: ctx });

    await w.loadDatabase();

    vitest.spyOn(w, 'loadDatabase').mockImplementationOnce(() => Promise.reject());
    w.emit(CE_WORKER_ACTION.LOAD_DATABASE);
  });

  it('loadDatabase - exception', async () => {
    const w = new NozzleEmitter({ context: ctx });
    const spy1 = vitest
      .spyOn(ffp, 'getSchemaFilterFilePath')
      .mockImplementationOnce(() => Promise.resolve(undefined));
    const spy2 = vitest
      .spyOn(odb, 'openDatabase')
      .mockImplementationOnce(() => Promise.resolve({}));

    try {
      await w.loadDatabase();
    } catch (err) {
      spy1.mockRestore();
      spy2.mockRestore();
      expect(err).toBeTruthy();
    }
  });

  it('loadDatabase - db', async () => {
    const w = new NozzleEmitter({ context: ctx });
    const dbData = await getData<Record<string, IDatabaseItem>>(
      path.join(__dirname, 'data/001.json'),
    );
    const spy1 = vitest
      .spyOn(ffp, 'getSchemaFilterFilePath')
      .mockImplementationOnce(() => Promise.resolve(undefined));
    const spy2 = vitest
      .spyOn(odb, 'openDatabase')
      .mockImplementationOnce(() => Promise.resolve(dbData));

    await w.loadDatabase();

    spy1.mockRestore();
    spy2.mockRestore();
  });
});

describe('WorkEmitter - create schema', () => {
  it('createJsonSchema - mapped access + call', async () => {
    const w = new NozzleEmitter({ context: ctx });

    await w.createJsonSchema({
      filePath: path.join(ctx.option.cwd, 'IProfessorDto.ts'),
      exportedType: 'IProfessorDto',
    });
  });

  it('createJsonSchema - mapped access - call', async () => {
    const w = new NozzleEmitter({ context: ctx });

    await w.createJsonSchema({
      filePath: path.join(ctx.option.cwd, 'IProfessorDto.ts'),
      exportedType: 'IProfessorDto',
    });
  });

  it('createJsonSchema - empty definitions + emit', async () => {
    const w = new NozzleEmitter({ context: ctx });

    const payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA>['data'] =
      {
        filePath: path.join(ctx.option.cwd, 'CE_MAJOR.ts'),
        exportedType: 'CE_MAJOR',
      };
    w.emit(CE_WORKER_ACTION.CREATE_JSON_SCHEMA, payload);
  });

  it('createJsonSchema - with root type + emit exception', async () => {
    const w = new NozzleEmitter({ context: ctx });

    const payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA>['data'] =
      {
        filePath: path.join(ctx.option.cwd, 'IProfessorDto.ts'),
        exportedType: 'IProfessorDto',
      };

    const spy = vitest.spyOn(w, 'createJsonSchema').mockImplementationOnce(() => Promise.reject());

    try {
      w.emit(CE_WORKER_ACTION.CREATE_JSON_SCHEMA, payload);
    } catch {
      spy.mockRestore();
    }
  });

  describe('createJsonSchema', () => {
    afterEach(async () => {
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

      ctx.generator = createGenerator({
        ...ctx.option.generatorOptionObject,
        type: '*',
      });
    });

    it('createJsonSchema create generator error', async () => {
      const w = new NozzleEmitter({ context: ctx });
      ctx.generatorOption = {};

      await w.createJsonSchema({
        filePath: path.join(ctx.option.cwd, 'const-enum', 'CE_MAJOR.ts'),
        exportedType: 'CE_MAJOR',
      });
    });
  });

  it('createJsonSchema - fail', async () => {
    const w = new NozzleEmitter({ context: ctx });

    try {
      await w.createJsonSchema({
        filePath: path.join(ctx.option.cwd, 'IProfessorDto.ts'),
        exportedType: 'IProfessorDto33',
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('createJsonSchemaBulk - call', async () => {
    const w = new NozzleEmitter({ context: ctx });

    await w.createJsonSchemaBulk([
      {
        filePath: path.join(ctx.option.cwd, 'IReqReadStudentDto.ts'),
        exportedType: 'IReqReadStudentQuerystring',
      },
      {
        filePath: path.join(ctx.option.cwd, 'IReqReadStudentDto.ts'),
        exportedType: 'IReqReadStudentParam',
      },
    ]);
  });

  it('createJsonSchemaBulk - emit', async () => {
    const w = new NozzleEmitter({ context: ctx });

    const payload: TPickMasterToWorkerMessage<
      typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK
    >['data'] = [
      {
        filePath: path.join(ctx.option.cwd, 'IReqReadStudentDto.ts'),
        exportedType: 'IReqReadStudentParam',
      },
      {
        filePath: path.join(ctx.option.cwd, 'IReqReadStudentDto.ts'),
        exportedType: 'IReqReadStudentQuerystring',
      },
      {
        filePath: path.join(ctx.option.cwd, 'IProfessorDto.ts'),
        exportedType: 'IProfessorDto',
      },
    ];

    w.emit(CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK, payload);
  });

  it('createJsonSchemaBulk - call either fail', async () => {
    const w = new NozzleEmitter({ context: ctx });

    await w.createJsonSchemaBulk([
      {
        // add cache logic, so wilful error raising what do pass invalid exportedType
        filePath: path.join(ctx.option.cwd, 'IProfessorDto.ts'),
        exportedType: 'IProfessorDto222',
      },
    ]);
  });

  it('createJsonSchemaBulk - call either fail', async () => {
    const w = new NozzleEmitter({ context: ctx });

    await w.createJsonSchemaBulk([
      {
        filePath: path.join(ctx.option.cwd, 'IReqReadStudentDto.ts'),
        exportedType: 'IReqReadStudentParam',
      },
      {
        filePath: path.join(ctx.option.cwd, 'IReqReadStudentDto.ts'),
        exportedType: 'IReqReadStudentQuerystring',
      },
      {
        filePath: path.join(ctx.option.cwd, 'IProfessorDto.ts'),
        exportedType: 'IProfessorDto',
      },
    ]);
  });
});
