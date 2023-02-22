import getDiagnostics from '#compilers/getDiagnostics';
import getSoruceFileExportedTypes from '#compilers/getSoruceFileExportedTypes';
import getTsProject from '#compilers/getTsProject';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import type TWatchSchemaOption from '#configs/interfaces/TWatchSchemaOption';
import createDatabaseItem from '#databases/createDatabaseItem';
import openDatabase from '#databases/openDatabase';
import createJSONSchema from '#modules/createJSONSchema';
import errorTrace from '#modules/errorTrace';
import getSchemaFilterFilePath from '#modules/getSchemaFilterFilePath';
import type IDatabaseItem from '#modules/interfaces/IDatabaseItem';
import summarySchemaFiles from '#modules/summarySchemaFiles';
import summarySchemaTypes from '#modules/summarySchemaTypes';
import logger from '#tools/logger';
import { CE_MASTER_ACTION } from '#workers/interfaces/CE_MASTER_ACTION';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type TMasterToWorkerMessage from '#workers/interfaces/TMasterToWorkerMessage';
import type { TPickMasterToWorkerMessage } from '#workers/interfaces/TMasterToWorkerMessage';
import type TWorkerToMasterMessage from '#workers/interfaces/TWorkerToMasterMessage';
import type {
  IFailWorkerToMasterTaskComplete,
  TFailData,
  TPickPassWorkerToMasterTaskComplete,
} from '#workers/interfaces/TWorkerToMasterMessage';
import dayjs from 'dayjs';
import fastCopy from 'fast-copy';
import ignore, { type Ignore } from 'ignore';
import type { JSONSchema7 } from 'json-schema';
import { atOrThrow, isError } from 'my-easy-fp';
import { getDirname } from 'my-node-fp';
import { fail, isPass, pass } from 'my-only-either';
import { EventEmitter } from 'node:events';
import path from 'path';
import * as tjsg from 'ts-json-schema-generator';
import type * as tsm from 'ts-morph';
import type { SetRequired } from 'type-fest';

const log = logger();

export default class NozzleEmitter extends EventEmitter {
  accessor project: tsm.Project | undefined;

  accessor option: TAddSchemaOption | TRefreshSchemaOption | TWatchSchemaOption | undefined;

  accessor id: number = 0;

  accessor files: { origin: string; refined: string }[];

  accessor types: { filePath: string; identifier: string }[];

  accessor filter: Ignore;

  accessor generatorOption: tjsg.Config;

  #generator: tjsg.SchemaGenerator | undefined;

  accessor schemaes: { filePath: string; exportedType: string; schema: JSONSchema7 }[];

  accessor databaseItems: IDatabaseItem[];

  constructor(args?: {
    ee?: ConstructorParameters<typeof EventEmitter>[0];
    generator?: tjsg.SchemaGenerator;
  }) {
    super(args?.ee);

    this.project = undefined;
    this.filter = ignore();
    this.files = [];
    this.types = [];
    this.generatorOption = {};
    this.schemaes = [];
    this.#generator = args?.generator;
    this.databaseItems = [];

    process.on('SIGTERM', NozzleEmitter.terminate);

    this.on(
      CE_WORKER_ACTION.OPTION_LOAD,
      (payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.OPTION_LOAD>['data']) => {
        this.loadOption(payload);
      },
    );

    this.on(CE_WORKER_ACTION.TERMINATE, () => {
      NozzleEmitter.terminate(0);
    });

    this.on(CE_WORKER_ACTION.PROJECT_LOAD, () => {
      this.loadProject().catch(errorTrace);
    });

    this.on(CE_WORKER_ACTION.PROJECT_DIAGONOSTIC, () => {
      this.diagonostic().catch(errorTrace);
    });

    this.on(CE_WORKER_ACTION.LOAD_DATABASE, () => {
      this.loadDatabase().catch(errorTrace);
    });

    this.on(CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES, () => {
      this.workerSummarySchemaFiles().catch(errorTrace);
    });

    this.on(CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES, () => {
      this.workerSummarySchemaTypes().catch(errorTrace);
    });

    this.on(CE_WORKER_ACTION.SUMMARY_SCHEMA_FILE_TYPE, () => {
      this.workerSummarySchemaFileType().catch(errorTrace);
    });

    this.on(
      CE_WORKER_ACTION.CREATE_JSON_SCHEMA,
      (payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA>['data']) => {
        this.createJsonSchema(payload).catch(errorTrace);
      },
    );

    this.on(
      CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK,
      (
        payload: TPickMasterToWorkerMessage<
          typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK
        >['data'],
      ) => {
        this.createJsonSchemaBulk(payload).catch(errorTrace);
      },
    );

    this.on(
      CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD,
      (
        payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD>['data'],
      ) => {
        this.watchSourceFileAdd(payload).catch(errorTrace);
      },
    );

    this.on(
      CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE,
      (
        payload: TPickMasterToWorkerMessage<
          typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE
        >['data'],
      ) => {
        this.watchSourceFileChange(payload).catch(errorTrace);
      },
    );

    this.on(
      CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK,
      (
        payload: TPickMasterToWorkerMessage<
          typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK
        >['data'],
      ) => {
        this.watchSourceFileUnlink(payload).catch(errorTrace);
      },
    );
  }

  static terminate(this: void, code?: number) {
    process.exit(code ?? 0);
  }

  working(payload: TMasterToWorkerMessage) {
    this.emit(payload.command);
  }

  check(command: CE_WORKER_ACTION, message: string) {
    if (this.option == null || this.project == null) {
      // send message to master process
      const err = new Error(message);
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command,
          id: this.id,
          result: 'fail',
          error: {
            kind: 'error',
            message: err.message,
            stack: err.stack,
          },
        },
      } satisfies TWorkerToMasterMessage);

      process.exit(1);
    }

    return { option: this.option, project: this.project };
  }

  loadOption(payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.OPTION_LOAD>['data']) {
    this.option = payload.option;

    process.send?.({
      command: CE_MASTER_ACTION.TASK_COMPLETE,
      data: { id: this.id, result: 'pass', command: CE_WORKER_ACTION.OPTION_LOAD },
    } satisfies Extract<TWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
  }

  loadGenerator() {
    if (this.option == null) {
      return fail(new Error('empty option'));
    }

    try {
      const generator =
        this.#generator != null
          ? this.#generator
          : tjsg.createGenerator(this.option.generatorOptionObject);

      if (this.#generator == null) {
        this.#generator = generator;
      }

      return pass(generator);
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));
      return fail(err);
    }
  }

  async diagonostic() {
    const { option, project } = this.check(
      CE_WORKER_ACTION.PROJECT_DIAGONOSTIC,
      'project compile error: diagonostic fail',
    );

    const diagnostics = getDiagnostics({ option, project });

    if (diagnostics.type === 'fail') {
      const err = new Error('project compile error: diagonostic fail');

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          id: this.id,
          result: 'fail',
          command: CE_WORKER_ACTION.PROJECT_DIAGONOSTIC,
          error: { kind: 'error', message: err.message, stack: err.stack },
        },
      } satisfies Extract<TWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
    } else {
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          id: this.id,
          result: 'pass',
          command: CE_WORKER_ACTION.PROJECT_DIAGONOSTIC,
        },
      } satisfies Extract<TWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
    }
  }

  async loadProject() {
    const projectPath = this.option?.project;

    if (projectPath == null) {
      // send message to master process
      const err = new Error(`project load fail: undefined`);
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.PROJECT_LOAD,
          id: this.id,
          result: 'fail',
          error: { kind: 'error', message: err.message, stack: err.stack },
        },
      } satisfies TWorkerToMasterMessage);

      process.exit(1);
    }

    const project = await getTsProject({ tsConfigFilePath: projectPath });

    if (project.type === 'fail') {
      // send message to master process
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.PROJECT_LOAD,
          id: this.id,
          result: 'fail',
          error: { kind: 'error', message: project.fail.message, stack: project.fail.stack },
        },
      } satisfies TWorkerToMasterMessage);

      process.exit(1);
    }

    this.project = project.pass;

    process.send?.({
      command: CE_MASTER_ACTION.TASK_COMPLETE,
      data: {
        command: CE_WORKER_ACTION.PROJECT_LOAD,
        id: this.id,
        result: 'pass',
      },
    } satisfies TWorkerToMasterMessage);
  }

  async workerSummarySchemaFiles() {
    const { option, project } = this.check(
      CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES,
      'summary schema files fail',
    );

    const { filter: schemaFileFilter, filePaths } = await summarySchemaFiles(project, option);

    this.filter = schemaFileFilter;
    this.files = filePaths;

    log.trace(`Complete schema file summarying: ${JSON.stringify(this.files)}`);

    // send message to master process
    process.send?.({
      command: CE_MASTER_ACTION.TASK_COMPLETE,
      data: {
        command: CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES,
        id: this.id,
        result: 'pass',
        data: filePaths,
      },
    } satisfies TWorkerToMasterMessage);
  }

  async workerSummarySchemaTypes() {
    const { option, project } = this.check(
      CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES,
      'summary schema types fail',
    );

    const exportedTypes = await summarySchemaTypes(project, option, this.filter);

    this.types = exportedTypes;

    // send message to master process
    process.send?.({
      command: CE_MASTER_ACTION.TASK_COMPLETE,
      data: {
        command: CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES,
        id: this.id,
        result: 'pass',
        data: exportedTypes,
      },
    } satisfies TWorkerToMasterMessage);
  }

  async workerSummarySchemaFileType() {
    const { option, project } = this.check(
      CE_WORKER_ACTION.SUMMARY_SCHEMA_FILE_TYPE,
      'summary schema files, types fail',
    );

    const { filter: schemaFileFilter, filePaths } = await summarySchemaFiles(project, option);

    this.filter = schemaFileFilter;
    this.files = filePaths;

    log.trace(`Complete schema file summarying: ${JSON.stringify(this.files)}`);

    const exportedTypes = await summarySchemaTypes(project, option, this.filter);

    this.types = exportedTypes;

    // send message to master process
    process.send?.({
      command: CE_MASTER_ACTION.TASK_COMPLETE,
      data: {
        command: CE_WORKER_ACTION.SUMMARY_SCHEMA_FILE_TYPE,
        id: this.id,
        result: 'pass',
        data: exportedTypes,
      },
    } satisfies TWorkerToMasterMessage);
  }

  async loadDatabase() {
    const { option } = this.check(
      CE_WORKER_ACTION.LOAD_DATABASE,
      'ts-json-schema-generator project load fail',
    );

    const db = await openDatabase(option);
    const basePath = await getDirname(option.project);
    const schemaFilterFilePath = await getSchemaFilterFilePath(option.cwd, option.listFile);

    if (schemaFilterFilePath == null) {
      const exportedTypesInDb = Object.values(db)
        .filter(
          (record): record is SetRequired<IDatabaseItem, 'filePath'> => record.filePath != null,
        )
        .map((record) => {
          return {
            filePath: path.join(basePath, record.filePath),
            identifier: record.id,
          };
        });

      option.types = exportedTypesInDb.map((exportedType) => exportedType.identifier);
      option.files = exportedTypesInDb.map((exportedType) => exportedType.filePath);
    }

    if (schemaFilterFilePath == null && option.files.length <= 0 && option.types.length <= 0) {
      // send message to master process
      const err = new Error('Cannot found .nozzlefiles and empty database');

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.LOAD_DATABASE,
          id: this.id,
          result: 'fail',
          error: { kind: 'error', message: err.message, stack: err.stack },
        },
      } satisfies TWorkerToMasterMessage);
    } else {
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.LOAD_DATABASE,
          id: this.id,
          result: 'pass',
        },
      } satisfies TWorkerToMasterMessage);
    }
  }

  async createJsonSchema(
    payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA>['data'],
  ) {
    const { option } = this.check(
      CE_WORKER_ACTION.CREATE_JSON_SCHEMA,
      'ts-json-schema-generator project load fail',
    );

    const generator = this.loadGenerator();

    if (generator.type === 'fail') {
      // send message to master process
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK,
          id: this.id,
          result: 'fail',
          error: {
            kind: 'error',
            message: generator.fail.message,
            stack: generator.fail.stack,
          },
        } satisfies IFailWorkerToMasterTaskComplete,
      } satisfies TWorkerToMasterMessage);

      return;
    }

    const jsonSchema = createJSONSchema({
      filePath: payload.filePath,
      exportedType: payload.exportedType,
      generator: generator.pass,
    });

    if (jsonSchema.type === 'fail') {
      // send message to master process
      process.send?.({
        command: CE_MASTER_ACTION.PROGRESS_UPDATE,
        data: {
          schemaName: payload.exportedType,
        },
      } satisfies TWorkerToMasterMessage);

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.CREATE_JSON_SCHEMA,
          id: this.id,
          result: 'fail',
          error: {
            kind: 'json-schema-generate',
            message: jsonSchema.fail.message,
            stack: jsonSchema.fail.stack,
            exportedType: payload.exportedType,
            filePath: payload.filePath,
          },
        },
      } satisfies TWorkerToMasterMessage);

      return;
    }

    const item = createDatabaseItem(option, this.types, jsonSchema.pass);

    this.schemaes.push(jsonSchema.pass);
    this.databaseItems.push(item.item);

    const records =
      item.definitions != null && item.definitions.length > 0
        ? [item.item, ...item.definitions]
        : [item.item];

    this.databaseItems.push(...records);

    // send message to master process
    process.send?.({
      command: CE_MASTER_ACTION.PROGRESS_UPDATE,
      data: {
        schemaName: payload.exportedType,
      },
    } satisfies TWorkerToMasterMessage);

    process.send?.({
      command: CE_MASTER_ACTION.TASK_COMPLETE,
      data: {
        command: CE_WORKER_ACTION.CREATE_JSON_SCHEMA,
        id: this.id,
        result: 'pass',
        data: records,
      },
    } satisfies TWorkerToMasterMessage);
  }

  async createJsonSchemaBulk(
    payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK>['data'],
  ) {
    const { option } = this.check(
      CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK,
      'ts-json-schema-generator project load fail',
    );

    const generator = this.loadGenerator();

    if (generator.type === 'fail') {
      // send message to master process
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK,
          id: this.id,
          result: 'fail',
          error: {
            kind: 'error',
            message: generator.fail.message,
            stack: generator.fail.stack,
          },
        } satisfies IFailWorkerToMasterTaskComplete,
      } satisfies TWorkerToMasterMessage);

      return;
    }

    const startAt = dayjs();
    const schemas: ReturnType<typeof createJSONSchema>[] = [];
    const items: IDatabaseItem[] = [];
    const errors: Extract<TFailData, { kind: 'json-schema-generate' }>[] = [];
    const exportedTypes = fastCopy(payload);

    await new Promise<void>((resolve) => {
      const intervalHandle = setInterval(() => {
        const exportedType = exportedTypes.shift();
        const currentAt = dayjs();

        // timeout, wait 30 second
        if (exportedType == null || currentAt.diff(startAt, 'second') > option.generatorTimeout) {
          clearInterval(intervalHandle);
          resolve();
          return;
        }

        const jsonSchema = createJSONSchema({
          filePath: exportedType.filePath,
          exportedType: exportedType.exportedType,
          generator: generator.pass,
        });

        if (isPass(jsonSchema)) {
          this.schemaes.push(jsonSchema.pass);

          const databaseItem = createDatabaseItem(option, this.types, jsonSchema.pass);

          const definitionItems =
            databaseItem.definitions != null && databaseItem.definitions.length > 0
              ? [databaseItem.item, ...databaseItem.definitions]
              : [databaseItem.item];

          this.databaseItems.push(databaseItem.item);
          items.push(databaseItem.item);

          this.databaseItems.push(...definitionItems);
          items.push(...definitionItems);
        } else {
          errors.push({
            kind: 'json-schema-generate',
            message: jsonSchema.fail.message,
            stack: jsonSchema.fail.stack,
            exportedType: exportedType.exportedType,
            filePath: exportedType.filePath,
          });
        }

        // send message to master process
        process.send?.({
          command: CE_MASTER_ACTION.PROGRESS_UPDATE,
          data: {
            schemaName: exportedType.exportedType,
          },
        } satisfies TWorkerToMasterMessage);

        schemas.push(jsonSchema);
      }, 20);
    });

    // send message to master process
    process.send?.({
      command: CE_MASTER_ACTION.TASK_COMPLETE,
      data: {
        command: CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK,
        id: this.id,
        result: 'pass',
        data: {
          pass: items,
          fail: errors,
        },
      } satisfies TPickPassWorkerToMasterTaskComplete<
        typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK
      >,
    } satisfies TWorkerToMasterMessage);
  }

  async watchSourceFileAdd(
    payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD>['data'],
  ) {
    const { option, project } = this.check(
      CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD,
      'ts-json-schema-generator project load fail',
    );

    try {
      const sourceFile = project.addSourceFileAtPath(payload.filePath);
      const exportedTypes = getSoruceFileExportedTypes(sourceFile);

      option.files = [payload.filePath];

      if (exportedTypes.length > 0) {
        this.#generator = tjsg.createGenerator({
          ...option.generatorOptionObject,
          path: payload.filePath,
          type: atOrThrow(exportedTypes, 0).identifier,
        });
      }

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD,
          id: this.id,
          result: 'pass',
          data: exportedTypes.map((exportedType) => ({
            filePath: exportedType.filePath,
            identifier: exportedType.identifier,
          })),
        } satisfies TPickPassWorkerToMasterTaskComplete<
          typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD
        >,
      } satisfies TWorkerToMasterMessage);
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD,
          id: this.id,
          result: 'fail',
          error: {
            kind: 'error',
            message: err.message,
            stack: err.stack,
          },
        } satisfies IFailWorkerToMasterTaskComplete,
      } satisfies TWorkerToMasterMessage);
    }
  }

  async watchSourceFileChange(
    payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE>['data'],
  ) {
    try {
      const { option, project } = this.check(
        CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE,
        'ts-json-schema-generator project load fail',
      );

      const sourceFile = project.getSourceFile(payload.filePath);
      option.files = [payload.filePath];

      log.trace(`watch source-file: ${payload.filePath}`);

      if (sourceFile == null) {
        throw new Error(`Cannot found watch-file: ${payload.filePath}`);
      }

      await sourceFile.refreshFromFileSystem();
      const exportedTypes = getSoruceFileExportedTypes(sourceFile);

      if (exportedTypes.length > 0) {
        this.#generator = tjsg.createGenerator({
          ...option.generatorOptionObject,
          path: payload.filePath,
          type: atOrThrow(exportedTypes, 0).identifier,
        });
      }

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE,
          id: this.id,
          result: 'pass',
          data: exportedTypes.map((exportedType) => ({
            filePath: exportedType.filePath,
            identifier: exportedType.identifier,
          })),
        } satisfies TPickPassWorkerToMasterTaskComplete<
          typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE
        >,
      } satisfies TWorkerToMasterMessage);
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE,
          id: this.id,
          result: 'fail',
          error: {
            kind: 'error',
            message: err.message,
            stack: err.stack,
          },
        } satisfies IFailWorkerToMasterTaskComplete,
      } satisfies TWorkerToMasterMessage);
    }
  }

  async watchSourceFileUnlink(
    payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK>['data'],
  ) {
    try {
      const { project, option } = this.check(
        CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK,
        'ts-json-schema-generator project load fail',
      );

      const sourceFile = project.getSourceFile(payload.filePath);

      if (sourceFile == null) {
        throw new Error(`Cannot found watch-file: ${payload.filePath}`);
      }

      const exportedTypes = getSoruceFileExportedTypes(sourceFile);
      project.removeSourceFile(sourceFile);

      if (exportedTypes.length > 0) {
        this.#generator = tjsg.createGenerator({
          ...option.generatorOptionObject,
          path: payload.filePath,
          type: atOrThrow(exportedTypes, 0).identifier,
        });
      }

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK,
          id: this.id,
          result: 'pass',
          data: exportedTypes.map((exportedType) => ({
            filePath: exportedType.filePath,
            identifier: exportedType.identifier,
          })),
        } satisfies TPickPassWorkerToMasterTaskComplete<
          typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK
        >,
      } satisfies TWorkerToMasterMessage);
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK,
          id: this.id,
          result: 'fail',
          error: {
            kind: 'error',
            message: err.message,
            stack: err.stack,
          },
        } satisfies IFailWorkerToMasterTaskComplete,
      } satisfies TWorkerToMasterMessage);
    }
  }
}
