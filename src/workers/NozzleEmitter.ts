import getDiagnostics from '#compilers/getDiagnostics';
import getTsProject from '#compilers/getTsProject';
import getSchemaGeneratorOption from '#configs/getSchemaGeneratorOption';
import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import createJSONSchema from '#modules/createJSONSchema';
import createSchemaRecord from '#modules/createSchemaRecord';
import type IDatabaseRecord from '#modules/interfaces/IDatabaseRecord';
import summarySchemaFiles from '#modules/summarySchemaFiles';
import summarySchemaTypes from '#modules/summarySchemaTypes';
import logger from '#tools/logger';
import { CE_MASTER_ACTION } from '#workers/interfaces/CE_MASTER_ACTION';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type TMasterToWorkerMessage from '#workers/interfaces/TMasterToWorkerMessage';
import type { TPickMasterToWorkerMessage } from '#workers/interfaces/TMasterToWorkerMessage';
import type IWorkerToMasterMessage from '#workers/interfaces/TWorkerToMasterMessage';
import ignore, { type Ignore } from 'ignore';
import type { JSONSchema7 } from 'json-schema';
import { isError } from 'my-easy-fp';
import { EventEmitter } from 'node:events';
import type * as tjsg from 'ts-json-schema-generator';
import type * as tsm from 'ts-morph';

const log = logger();

export default class NozzleEmitter extends EventEmitter {
  accessor project: tsm.Project | undefined;

  accessor option: TAddSchemaOption | TRefreshSchemaOption | undefined;

  accessor resolvedPaths: IResolvedPaths | undefined;

  accessor id: number = 0;

  accessor files: { origin: string; refined: string }[];

  accessor types: { filePath: string; identifier: string }[];

  accessor filter: Ignore;

  accessor generatorOption: tjsg.Config;

  accessor schemaes: { filePath: string; exportedType: string; schema: JSONSchema7 }[];

  accessor schemaRecords: IDatabaseRecord[];

  constructor(args?: { ee: ConstructorParameters<typeof EventEmitter>[0] }) {
    super(args?.ee);

    this.project = undefined;
    this.filter = ignore();
    this.files = [];
    this.types = [];
    this.generatorOption = {};
    this.schemaes = [];
    this.schemaRecords = [];

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
      this.loadProject().catch((catched) => {
        const err = isError(catched, new Error('unknown error raised'));
        log.error(err.message);
        log.error(err.stack);
      });
    });

    this.on(CE_WORKER_ACTION.PROJECT_DIAGOSTIC, () => {
      this.diagonostic().catch((catched) => {
        const err = isError(catched, new Error('unknown error raised'));
        log.error(err.message);
        log.error(err.stack);
      });
    });

    this.on(CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES, () => {
      this.summarySchemaFiles().catch((catched) => {
        const err = isError(catched, new Error('unknown error raised'));
        log.error(err.message);
        log.error(err.stack);
      });
    });

    this.on(CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES, () => {
      this.summarySchemaTypes().catch((catched) => {
        const err = isError(catched, new Error('unknown error raised'));
        log.error(err.message);
        log.error(err.stack);
      });
    });

    this.on(CE_WORKER_ACTION.GENERATOR_OPTION_LOAD, () => {
      this.generatorOptionLoad().catch((catched) => {
        const err = isError(catched, new Error('unknown error raised'));
        log.error(err.message);
        log.error(err.stack);
      });
    });

    this.on(
      CE_WORKER_ACTION.CREATE_JSON_SCHEMA,
      (payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA>['data']) => {
        this.createJsonSchema(payload).catch((catched) => {
          const err = isError(catched, new Error('unknown error raised'));
          log.error(err.message);
          log.error(err.stack);
        });
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
    if (this.option == null || this.resolvedPaths == null || this.project == null) {
      // send message to master process
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: { command, id: this.id, result: 'fail', error: new Error(message) },
      } satisfies IWorkerToMasterMessage);

      process.exit(1);
    }

    return { option: this.option, resolvedPaths: this.resolvedPaths, project: this.project };
  }

  loadOption(payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.OPTION_LOAD>['data']) {
    this.option = payload.option;
    this.resolvedPaths = payload.resolvedPaths;

    process.send?.({
      command: CE_MASTER_ACTION.TASK_COMPLETE,
      data: { id: this.id, result: 'pass', command: CE_WORKER_ACTION.OPTION_LOAD },
    } satisfies Extract<IWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
  }

  async diagonostic() {
    const { option, project } = this.check(
      CE_WORKER_ACTION.PROJECT_DIAGOSTIC,
      'project compile fail',
    );

    const diagnostics = getDiagnostics({ option, project });

    if (diagnostics.type === 'fail') {
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          id: this.id,
          result: 'fail',
          command: CE_WORKER_ACTION.PROJECT_DIAGOSTIC,
          error: new Error('project compile fail'),
        },
      } satisfies Extract<IWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
    } else {
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          id: this.id,
          result: 'pass',
          command: CE_WORKER_ACTION.PROJECT_DIAGOSTIC,
        },
      } satisfies Extract<IWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
    }
  }

  async loadProject() {
    const projectPath = this.option?.project;

    if (projectPath == null) {
      // send message to master process
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.PROJECT_LOAD,
          id: this.id,
          result: 'fail',
          error: new Error('project load fail: empty project path'),
        },
      } satisfies IWorkerToMasterMessage);

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
          error: new Error('project load fail: empty project path'),
        },
      } satisfies IWorkerToMasterMessage);

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
    } satisfies IWorkerToMasterMessage);
  }

  async summarySchemaFiles() {
    const { option, resolvedPaths, project } = this.check(
      CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES,
      'summary schema files fail',
    );

    const { filter: schemaFileFilter, filePaths } = await summarySchemaFiles(
      project,
      option,
      resolvedPaths,
    );

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
    } satisfies IWorkerToMasterMessage);
  }

  async summarySchemaTypes() {
    const { option, resolvedPaths, project } = this.check(
      CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES,
      'summary schema types fail',
    );

    const exportedTypes = await summarySchemaTypes(project, option, resolvedPaths, this.filter);

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
    } satisfies IWorkerToMasterMessage);
  }

  async generatorOptionLoad() {
    const { option } = this.check(
      CE_WORKER_ACTION.GENERATOR_OPTION_LOAD,
      'ts-json-schema-generator option load fail',
    );

    this.generatorOption = await getSchemaGeneratorOption(option);

    // send message to master process
    process.send?.({
      command: CE_MASTER_ACTION.TASK_COMPLETE,
      data: {
        command: CE_WORKER_ACTION.GENERATOR_OPTION_LOAD,
        id: this.id,
        result: 'pass',
        data: this.generatorOption,
      },
    } satisfies IWorkerToMasterMessage);
  }

  async createJsonSchema(
    payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA>['data'],
  ) {
    const { resolvedPaths, option } = this.check(
      CE_WORKER_ACTION.CREATE_JSON_SCHEMA,
      'ts-json-schema-generator project load fail',
    );

    const jsonSchema = createJSONSchema(
      payload.filePath,
      payload.exportedType,
      this.generatorOption,
    );

    if (jsonSchema.type === 'fail') {
      // send message to master process
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.CREATE_JSON_SCHEMA,
          id: this.id,
          result: 'fail',
          error: jsonSchema.fail,
        },
      } satisfies IWorkerToMasterMessage);

      return;
    }

    this.schemaes.push(jsonSchema.pass);

    const schemaRecord = await createSchemaRecord(
      option,
      resolvedPaths,
      this.types,
      jsonSchema.pass,
    );

    this.schemaRecords.push(schemaRecord.record);

    const records =
      schemaRecord.definitions != null && schemaRecord.definitions.length > 0
        ? [schemaRecord.record, ...schemaRecord.definitions]
        : [schemaRecord.record];

    this.schemaRecords.push(...records);

    // send message to master process
    process.send?.({
      command: CE_MASTER_ACTION.TASK_COMPLETE,
      data: {
        command: CE_WORKER_ACTION.CREATE_JSON_SCHEMA,
        id: this.id,
        result: 'pass',
        data: records,
      },
    } satisfies IWorkerToMasterMessage);
  }
}
