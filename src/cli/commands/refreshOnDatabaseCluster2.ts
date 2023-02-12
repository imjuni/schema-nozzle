import spinner from '#cli/display/spinner';
import getResolvedPaths from '#configs/getResolvedPaths';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import openDatabase from '#databases/openDatabase';
import saveDatabase from '#databases/saveDatabase';
import mergeSchemaRecords from '#modules/mergeSchemaRecords';
import logger from '#tools/logger';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type TMasterToWorkerMessage from '#workers/interfaces/TMasterToWorkerMessage';
import {
  isFailTaskComplete,
  isPassTaskComplete,
  type TPassWorkerToMasterTaskComplete,
} from '#workers/interfaces/TWorkerToMasterMessage';
import workers from '#workers/workers';
import cluster from 'cluster';
import { atOrThrow, isError, populate } from 'my-easy-fp';
import os from 'os';

const log = logger();

export default async function refreshOnDatabaseCluster2(cliOption: TRefreshSchemaOption) {
  try {
    // populate(2).forEach(() => {
    populate(os.cpus().length).forEach(() => {
      workers.add(cluster.fork());
    });

    const option = { ...cliOption };
    const resolvedPaths = getResolvedPaths(option);

    option.output = resolvedPaths.output;
    option.project = resolvedPaths.project;

    log.trace(`start: ${os.cpus().length}`);
    log.trace(`cwd: ${resolvedPaths.cwd}/${resolvedPaths.project}`);
    log.trace(`${JSON.stringify(option)}`);

    workers.sendAll({
      command: CE_WORKER_ACTION.OPTION_LOAD,
      data: { option: { ...option, project: resolvedPaths.project }, resolvedPaths },
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.OPTION_LOAD }>);

    await workers.wait();

    workers.sendAll({
      command: CE_WORKER_ACTION.PROJECT_LOAD,
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.PROJECT_LOAD }>);

    let reply = await workers.wait();

    log.trace(`reply::: ${JSON.stringify(reply)}`);

    // master check project loading on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw failReply.error;
    }

    workers.send({
      command: CE_WORKER_ACTION.PROJECT_DIAGOSTIC,
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.PROJECT_DIAGOSTIC }>);

    reply = await workers.wait();

    // master check project diagostic on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw failReply.error;
    }

    workers.send({
      command: CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES,
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES }>);

    reply = await workers.wait();

    // master check schema file summary
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw failReply.error;
    }

    workers.send({
      command: CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES,
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES }>);

    reply = await workers.wait();

    // master check schema type summary
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw failReply.error;
    }

    const { data: exportedTypes } = atOrThrow(reply.data, 0) as Extract<
      TPassWorkerToMasterTaskComplete,
      { command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES; result: 'pass' }
    >;

    workers.sendAll({
      command: CE_WORKER_ACTION.GENERATOR_OPTION_LOAD,
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.GENERATOR_OPTION_LOAD }>);

    reply = await workers.wait();

    // master check generator option loading
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw failReply.error;
    }

    workers.send(
      ...exportedTypes.map((exportedType) => {
        return {
          command: CE_WORKER_ACTION.CREATE_JSON_SCHEMA,
          data: { exportedType: exportedType.identifier, filePath: exportedType.filePath },
        } satisfies Extract<
          TMasterToWorkerMessage,
          { command: typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA }
        >;
      }),
    );

    reply = await workers.wait();

    const successes = reply.data.filter(isPassTaskComplete) as Extract<
      TPassWorkerToMasterTaskComplete,
      { command: typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA }
    >[];

    log.trace(`reply::: ${JSON.stringify(successes.map((items) => items.data).flat())}`);

    const db = await openDatabase(resolvedPaths);
    const newDb = mergeSchemaRecords(db, successes.map((item) => item.data).flat());

    await saveDatabase(option, newDb);

    workers.sendAll({ command: CE_WORKER_ACTION.TERMINATE });
  } catch (caught) {
    spinner.stop({ message: 'Error occured...', channel: 'fail' });
    const err = isError(caught, new Error('Unknown error raised'));
    throw err;
  }
}
