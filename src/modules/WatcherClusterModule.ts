import progress from '#cli/display/progress';
import type getExportedTypes from '#compilers/getExportedTypes';
import type TWatchSchemaOption from '#configs/interfaces/TWatchSchemaOption';
import deleteDatabaseItem from '#databases/deleteDatabaseItem';
import deleteDatabaseItemsByFile from '#databases/deleteDatabaseItemsByFile';
import mergeDatabaseItems from '#databases/mergeDatabaseItems';
import openDatabase from '#databases/openDatabase';
import saveDatabase from '#databases/saveDatabase';
import SchemaNozzleError from '#errors/SchemaNozzleError';
import createJSONSchemaCommand from '#modules/createJSONSchemaCommand';
import { CE_WATCH_EVENT } from '#modules/interfaces/CE_WATCH_EVENT';
import type IDatabaseItem from '#modules/interfaces/IDatabaseItem';
import type IWatchEvent from '#modules/interfaces/IWatchEvent';
import logger from '#tools/logger';
import type { CE_MASTER_ACTION } from '#workers/interfaces/CE_MASTER_ACTION';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type TMasterToWorkerMessage from '#workers/interfaces/TMasterToWorkerMessage';
import type { TPickMasterToWorkerMessage } from '#workers/interfaces/TMasterToWorkerMessage';
import type TWorkerToMasterMessage from '#workers/interfaces/TWorkerToMasterMessage';
import {
  isFailTaskComplete,
  isPassTaskComplete,
  type TPassWorkerToMasterTaskComplete,
  type TPickPassWorkerToMasterTaskComplete,
} from '#workers/interfaces/TWorkerToMasterMessage';
import workers from '#workers/workers';
import fastCopy from 'fast-copy';
import { atOrThrow } from 'my-easy-fp';
import path from 'path';
import type { LastArrayElement } from 'type-fest';

const log = logger();

export default class WatcherClusterModule {
  #option: TWatchSchemaOption;

  #workerSize: number;

  accessor reply: Extract<
    TWorkerToMasterMessage,
    { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }
  >['data'];

  constructor(args: { option: TWatchSchemaOption; workerSize: number }) {
    this.#option = args.option;
    this.#workerSize = args.workerSize;
    this.reply = {
      command: CE_WORKER_ACTION.NOOP,
      result: 'fail',
      id: 0,
      error: { kind: 'error', message: '' },
    };
  }

  async bulk(events: IWatchEvent[]) {
    const option = fastCopy(this.#option);

    workers.send({
      command: CE_WORKER_ACTION.WATCH_SOURCE_EVENT_FILE_SUMMARY,
      data: { filePaths: events.map((event) => event.filePath) },
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.WATCH_SOURCE_EVENT_FILE_SUMMARY>);

    let reply = await workers.wait();

    // master check project diagostic on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new SchemaNozzleError(failReply.error);
    }

    const { data: eventFileSummaries } = atOrThrow(
      reply.data,
      0,
    ) as TPickPassWorkerToMasterTaskComplete<
      typeof CE_WORKER_ACTION.WATCH_SOURCE_EVENT_FILE_SUMMARY
    >;

    option.files = eventFileSummaries.updateFiles;

    workers.broadcast({
      command: CE_WORKER_ACTION.OPTION_LOAD,
      data: { option },
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.OPTION_LOAD>);

    await workers.wait();

    workers.send({
      command: CE_WORKER_ACTION.SUMMARY_SCHEMA_FILE_TYPE,
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILE_TYPE>);

    reply = await workers.wait();

    // master check schema file summary
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new SchemaNozzleError(failReply.error);
    }

    workers.send({
      command: CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES,
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES }>);

    reply = await workers.wait();

    // master check schema type summary
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new SchemaNozzleError(failReply.error);
    }

    const { data: exportedTypes } = atOrThrow(reply.data, 0) as TPickPassWorkerToMasterTaskComplete<
      typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILE_TYPE
    >;

    option.types = exportedTypes.map((exportedType) => exportedType.identifier);

    workers.broadcast({
      command: CE_WORKER_ACTION.OPTION_LOAD,
      data: { option },
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.OPTION_LOAD }>);

    const generationCommands = createJSONSchemaCommand(this.#workerSize, exportedTypes);

    progress.start(exportedTypes.length, 0, '');
    workers.send(...generationCommands);

    reply = await workers.wait(option.generatorTimeout);

    progress.stop();

    const passes = reply.data.filter(isPassTaskComplete);

    if (passes.length > 0) {
      if (atOrThrow(passes, 0).command === CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK) {
        const pass = passes as Extract<
          TPassWorkerToMasterTaskComplete,
          { command: typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK }
        >[];
        const db = await openDatabase(option);
        const newDb = mergeDatabaseItems(db, pass.map((item) => item.data.pass).flat());

        await saveDatabase(option, newDb);
      } else {
        log.trace(`reply::: ${JSON.stringify(passes.map((items) => items.data).flat())}`);

        const items = passes as Extract<
          TPassWorkerToMasterTaskComplete,
          { command: typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA }
        >[];
        const db = await openDatabase(option);
        const newDb = mergeDatabaseItems(db, items.map((item) => item.data).flat());

        await saveDatabase(option, newDb);
      }
    }

    const db = await openDatabase(this.#option);

    const newDb = eventFileSummaries.deleteFiles.reduce((deletingDb, filePath) => {
      const nextDb = deleteDatabaseItemsByFile(deletingDb, filePath);
      return nextDb;
    }, db);

    await saveDatabase(this.#option, newDb);
  }

  async add(event: IWatchEvent) {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    log.trace(`received: ${resolved}`);
    option.files = [resolved];

    workers.broadcast({
      command: CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD,
      data: { kind: CE_WATCH_EVENT.ADD, filePath: resolved },
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD>);

    await workers.wait();
  }

  async change(event: IWatchEvent) {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    log.trace(`received: ${resolved}`);

    option.files = [resolved];

    workers.broadcast({
      command: CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE,
      data: { kind: CE_WATCH_EVENT.CHANGE, filePath: resolved },
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE>);

    await workers.wait();
  }

  async unlink(event: IWatchEvent) {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    log.trace(`received: ${resolved}`);

    workers.broadcast({
      command: CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK,
      data: { kind: CE_WATCH_EVENT.UNLINK, filePath: resolved },
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK>);

    await workers.wait();
  }

  async updateDatabase(items: IDatabaseItem[]) {
    const db = await openDatabase(this.#option);
    const newDb = mergeDatabaseItems(db, items);
    await saveDatabase(this.#option, newDb);
  }

  async deleteDatabase(
    exportedTypes: Pick<
      LastArrayElement<ReturnType<typeof getExportedTypes>>,
      'filePath' | 'identifier'
    >[],
  ) {
    const db = await openDatabase(this.#option);
    const newDb = exportedTypes.reduce((aggregation, item) => {
      const items = deleteDatabaseItem(aggregation, item.identifier);
      return items;
    }, fastCopy(db));
    await saveDatabase(this.#option, newDb);
  }
}
