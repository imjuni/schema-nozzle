import spinner from '#cli/display/spinner';
import getResolvedPaths from '#configs/getResolvedPaths';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import logger from '#tools/logger';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type TMasterToWorkerMessage from '#workers/interfaces/TMasterToWorkerMessage';
import { isFailTaskComplete } from '#workers/interfaces/TWorkerToMasterMessage';
import workers from '#workers/workers';
import cluster from 'cluster';
import { atOrThrow, isError, populate } from 'my-easy-fp';
import os from 'os';

const log = logger();

export default async function refreshOnDatabaseCluster2(option: TRefreshSchemaOption) {
  try {
    // populate(os.cpus().length).forEach(() => {
    populate(1).forEach(() => {
      workers.add(cluster.fork());
    });

    const resolvedPaths = getResolvedPaths(option);

    log.trace(`start: ${os.cpus().length}`);
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

    workers.sendAll({
      command: CE_WORKER_ACTION.PROJECT_DIAGOSTIC,
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.PROJECT_DIAGOSTIC }>);

    reply = await workers.wait();

    // master check project diagostic on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw failReply.error;
    }

    log.trace(`reply::: ${JSON.stringify(reply)}`);

    workers.sendAll({ command: CE_WORKER_ACTION.TERMINATE });
  } catch (catched) {
    spinner.stop({ message: 'Error occured...', channel: 'fail' });
    const err = isError(catched) ?? new Error('Unknown error raised');
    throw err;
  }
}
