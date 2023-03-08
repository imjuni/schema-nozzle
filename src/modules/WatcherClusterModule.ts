import spinner from '#cli/display/spinner';
import type getExportedTypes from '#compilers/getExportedTypes';
import type TWatchSchemaOption from '#configs/interfaces/TWatchSchemaOption';
import deleteDatabaseItem from '#databases/deleteDatabaseItem';
import mergeDatabaseItems from '#databases/mergeDatabaseItems';
import openDatabase from '#databases/openDatabase';
import saveDatabase from '#databases/saveDatabase';
import SchemaNozzleError from '#errors/SchemaNozzleError';
import { CE_WATCH_EVENT } from '#modules/interfaces/CE_WATCH_EVENT';
import type IDatabaseItem from '#modules/interfaces/IDatabaseItem';
import type IWatchEvent from '#modules/interfaces/IWatchEvent';
import logger from '#tools/logger';
import type { CE_MASTER_ACTION } from '#workers/interfaces/CE_MASTER_ACTION';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type { TPickMasterToWorkerMessage } from '#workers/interfaces/TMasterToWorkerMessage';
import type TWorkerToMasterMessage from '#workers/interfaces/TWorkerToMasterMessage';
import {
  isFailTaskComplete,
  isPassTaskComplete,
  type TPickPassWorkerToMasterTaskComplete,
} from '#workers/interfaces/TWorkerToMasterMessage';
import workers from '#workers/workers';
import chalk from 'chalk';
import fastCopy from 'fast-copy';
import { atOrThrow } from 'my-easy-fp';
import path from 'path';
import type { LastArrayElement } from 'type-fest';

const log = logger();

export default class WatcherClusterModule {
  #option: TWatchSchemaOption;

  accessor reply: Extract<
    TWorkerToMasterMessage,
    { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }
  >['data'];

  constructor(args: { option: TWatchSchemaOption }) {
    this.#option = args.option;
    this.reply = {
      command: CE_WORKER_ACTION.NOOP,
      result: 'fail',
      id: 0,
      error: { kind: 'error', message: '' },
    };
  }

  async add(event: IWatchEvent): Promise<IDatabaseItem[]> {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    log.trace(`received: ${resolved}`);
    option.files = [resolved];

    workers.broadcast({
      command: CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD,
      data: { kind: CE_WATCH_EVENT.ADD, filePath: resolved },
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD>);

    let reply = await workers.wait();

    // master check project diagostic on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new SchemaNozzleError(failReply.error);
    }

    spinner.update(`${chalk.greenBright('change')}: ${event.filePath} type analysis`);

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

    const { data: exportedTypes } = atOrThrow(reply.data, 0) as TPickPassWorkerToMasterTaskComplete<
      typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILE_TYPE
    >;

    spinner.update(
      `${chalk.greenBright('add')}: ${exportedTypes
        .map((exportedType) => exportedType.identifier)
        .join(', ')} json schema generating, ...`,
    );

    workers.send(
      ...exportedTypes.map((exportedType) => {
        return {
          command: CE_WORKER_ACTION.CREATE_JSON_SCHEMA,
          data: { exportedType: exportedType.identifier, filePath: exportedType.filePath },
        } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA>;
      }),
    );

    reply = await workers.wait();

    const passes = reply.data.filter(isPassTaskComplete);
    const items = passes as TPickPassWorkerToMasterTaskComplete<
      typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA
    >[];

    return items.map((item) => item.data).flat();
  }

  async change(event: IWatchEvent): Promise<IDatabaseItem[]> {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    log.trace(`received: ${resolved}`);

    option.files = [resolved];

    workers.broadcast({
      command: CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE,
      data: { kind: CE_WATCH_EVENT.CHANGE, filePath: resolved },
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE>);

    let reply = await workers.wait();

    // master check project diagostic on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new SchemaNozzleError(failReply.error);
    }

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

    const { data: exportedTypes } = atOrThrow(reply.data, 0) as TPickPassWorkerToMasterTaskComplete<
      typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILE_TYPE
    >;

    workers.send(
      ...exportedTypes.map((exportedType) => {
        return {
          command: CE_WORKER_ACTION.CREATE_JSON_SCHEMA,
          data: { exportedType: exportedType.identifier, filePath: exportedType.filePath },
        } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA>;
      }),
    );

    reply = await workers.wait();

    const passes = reply.data.filter(isPassTaskComplete);
    const items = passes as TPickPassWorkerToMasterTaskComplete<
      typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA
    >[];

    return items.map((item) => item.data).flat();
  }

  async unlink(
    event: IWatchEvent,
  ): Promise<
    Pick<LastArrayElement<ReturnType<typeof getExportedTypes>>, 'filePath' | 'identifier'>[]
  > {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    log.trace(`received: ${resolved}`);

    workers.broadcast({
      command: CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK,
      data: { kind: CE_WATCH_EVENT.UNLINK, filePath: resolved },
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK>);

    const reply = await workers.wait();

    const passes = reply.data.filter(isPassTaskComplete);
    const exportedTypes = (
      passes as TPickPassWorkerToMasterTaskComplete<
        typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK
      >[]
    )
      .map((exportedType) => exportedType.data)
      .flat();

    log.trace(
      `delete: ${exportedTypes.length}, ${exportedTypes.map((item) => item.identifier).join(', ')}`,
    );

    return exportedTypes;
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
