import { getDiagnostics } from '#/compilers/getDiagnostics';
import { getSoruceFileExportedTypes } from '#/compilers/getSoruceFileExportedTypes';
import { getTsProject } from '#/compilers/getTsProject';
import { createDatabaseItem } from '#/databases/createDatabaseItem';
import { openDatabase } from '#/databases/openDatabase';
import { createJSONSchema } from '#/modules/createJSONSchema';
import { errorTrace } from '#/modules/errorTrace';
import { getSchemaFilterFilePath } from '#/modules/getSchemaFilterFilePath';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import { summarySchemaFiles } from '#/modules/summarySchemaFiles';
import { summarySchemaTypes } from '#/modules/summarySchemaTypes';
import { NozzleContext } from '#/workers/NozzleContext';
import { CE_MASTER_ACTION } from '#/workers/interfaces/CE_MASTER_ACTION';
import { CE_WORKER_ACTION } from '#/workers/interfaces/CE_WORKER_ACTION';
import type {
  TMasterToWorkerMessage,
  TPickMasterToWorkerMessage,
} from '#/workers/interfaces/TMasterToWorkerMessage';
import type {
  IFailWorkerToMasterTaskComplete,
  TFailData,
  TPickPassWorkerToMasterTaskComplete,
  TWorkerToMasterMessage,
} from '#/workers/interfaces/TWorkerToMasterMessage';
import type { AnySchemaObject } from 'ajv';
import consola from 'consola';
import dayjs from 'dayjs';
import fastCopy from 'fast-copy';
import ignore, { type Ignore } from 'ignore';
import { isError } from 'my-easy-fp';
import { getDirname } from 'my-node-fp';
import { isPass } from 'my-only-either';
import { EventEmitter } from 'node:events';
import path from 'path';
import { createGenerator } from 'ts-json-schema-generator';
import type { SetRequired } from 'type-fest';

export class NozzleEmitter extends EventEmitter {
  #context: NozzleContext;

  accessor id: number = 0;

  accessor files: { origin: string; refined: string }[];

  accessor types: { filePath: string; identifier: string }[];

  accessor filter: Ignore;

  accessor schemaes: { filePath: string; exportedType: string; schema: AnySchemaObject }[];

  accessor databaseItems: IDatabaseItem[];

  constructor(args?: {
    ee?: ConstructorParameters<typeof EventEmitter>[0];
    context?: NozzleContext;
  }) {
    super(args?.ee);

    this.filter = ignore();
    this.files = [];
    this.types = [];
    this.schemaes = [];
    this.databaseItems = [];
    this.#context = args?.context ?? new NozzleContext();

    if (process.listeners('SIGTERM').length <= 0) {
      process.on('SIGTERM', NozzleEmitter.terminate);
    }

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

    this.on(
      CE_WORKER_ACTION.WATCH_SOURCE_EVENT_FILE_SUMMARY,
      (
        payload: TPickMasterToWorkerMessage<
          typeof CE_WORKER_ACTION.WATCH_SOURCE_EVENT_FILE_SUMMARY
        >['data'],
      ) => {
        this.watchSourceEventFileSummary(payload).catch(errorTrace);
      },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  static terminate(this: void, code?: number) {
    process.exit(code ?? 0);
  }

  working(payload: TMasterToWorkerMessage) {
    this.emit(payload.command);
  }

  loadOption(payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.OPTION_LOAD>['data']) {
    this.#context.option = payload.option;
    this.#context.generatorOption = payload.option.generatorOptionObject;
    this.#context.generator = createGenerator({
      ...this.#context.generatorOption,
      type: '*',
    });

    process.send?.({
      command: CE_MASTER_ACTION.TASK_COMPLETE,
      data: { id: this.id, result: 'pass', command: CE_WORKER_ACTION.OPTION_LOAD },
    } satisfies Extract<
      TWorkerToMasterMessage,
      { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }
    >);
  }

  async diagonostic() {
    const diagnostics = getDiagnostics({
      option: this.#context.option,
      project: this.#context.project,
    });

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
      } satisfies Extract<
        TWorkerToMasterMessage,
        { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }
      >);
    } else {
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          id: this.id,
          result: 'pass',
          command: CE_WORKER_ACTION.PROJECT_DIAGONOSTIC,
        },
      } satisfies Extract<
        TWorkerToMasterMessage,
        { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }
      >);
    }
  }

  async loadProject() {
    const projectPath = this.#context.option.project;
    const project = await getTsProject({ tsConfigFilePath: projectPath });

    this.#context.project = project;

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
    const { filter: schemaFileFilter, filePaths } = await summarySchemaFiles(
      this.#context.project,
      this.#context.option,
    );

    this.filter = schemaFileFilter;
    this.files = filePaths;

    consola.trace(`Complete schema file summarying: ${JSON.stringify(this.files)}`);

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
    const exportedTypes = await summarySchemaTypes(
      this.#context.project,
      this.#context.option,
      this.filter,
    );

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
    const { filter: schemaFileFilter, filePaths } = await summarySchemaFiles(
      this.#context.project,
      this.#context.option,
    );

    this.filter = schemaFileFilter;
    this.files = filePaths;

    consola.trace(`Complete schema file summarying: ${JSON.stringify(this.files)}`);

    const exportedTypes = await summarySchemaTypes(
      this.#context.project,
      this.#context.option,
      this.filter,
    );

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
    const db = await openDatabase(this.#context.option);
    const basePath = await getDirname(this.#context.option.project);
    const schemaFilterFilePath = await getSchemaFilterFilePath(
      this.#context.option.cwd,
      this.#context.option.listFile,
    );

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

      this.#context.updateFiles(exportedTypesInDb.map((exportedType) => exportedType.filePath));
      this.#context.updateTypes(exportedTypesInDb.map((exportedType) => exportedType.identifier));
    }

    if (
      schemaFilterFilePath == null &&
      this.#context.option.files.length <= 0 &&
      this.#context.option.types.length <= 0
    ) {
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
    const jsonSchema = createJSONSchema({
      filePath: payload.filePath,
      exportedType: payload.exportedType,
      generator: this.#context.generator,
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

    const item = createDatabaseItem(
      this.#context.project,
      this.#context.option,
      this.types,
      jsonSchema.pass,
    );

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
        if (
          exportedType == null ||
          currentAt.diff(startAt, 'second') > this.#context.option.generatorTimeout
        ) {
          clearInterval(intervalHandle);
          resolve();
          return;
        }

        const jsonSchema = createJSONSchema({
          filePath: exportedType.filePath,
          exportedType: exportedType.exportedType,
          generator: this.#context.generator,
        });

        if (isPass(jsonSchema)) {
          this.schemaes.push(jsonSchema.pass);

          const databaseItem = createDatabaseItem(
            this.#context.project,
            this.#context.option,
            this.types,
            jsonSchema.pass,
          );

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
    try {
      const sourceFile = this.#context.project.addSourceFileAtPath(payload.filePath);
      const exportedTypes = getSoruceFileExportedTypes(sourceFile);

      this.#context.updateFiles([payload.filePath]);

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
      const sourceFile = this.#context.project.getSourceFile(payload.filePath);
      this.#context.updateFiles([payload.filePath]);

      consola.trace(`watch source-file: ${payload.filePath}`);

      if (sourceFile == null) {
        throw new Error(`Cannot found watch-file: ${payload.filePath}`);
      }

      await sourceFile.refreshFromFileSystem();
      const exportedTypes = getSoruceFileExportedTypes(sourceFile);

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
      const sourceFile = this.#context.project.getSourceFile(payload.filePath);

      if (sourceFile == null) {
        throw new Error(`Cannot found watch-file: ${payload.filePath}`);
      }

      const exportedTypes = getSoruceFileExportedTypes(sourceFile);
      this.#context.project.removeSourceFile(sourceFile);

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

  async watchSourceEventFileSummary(
    payload: TPickMasterToWorkerMessage<
      typeof CE_WORKER_ACTION.WATCH_SOURCE_EVENT_FILE_SUMMARY
    >['data'],
  ) {
    try {
      const updateFiles = payload.filePaths.filter(
        (filePath) => this.#context.project.getSourceFile(filePath) != null,
      );
      const deleteFiles = payload.filePaths.filter(
        (filePath) => this.#context.project.getSourceFile(filePath) == null,
      );

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.WATCH_SOURCE_EVENT_FILE_SUMMARY,
          id: this.id,
          result: 'pass',
          data: {
            updateFiles,
            deleteFiles,
          },
        } satisfies TPickPassWorkerToMasterTaskComplete<
          typeof CE_WORKER_ACTION.WATCH_SOURCE_EVENT_FILE_SUMMARY
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
