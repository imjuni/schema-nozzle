import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import getResolvedPaths from '#configs/getResolvedPaths';
import getSchemaGeneratorOption from '#configs/getSchemaGeneratorOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import type { TRefreshSchemaBaseOption } from '#configs/interfaces/TRefreshSchemaOption';
import mergeDatabaseItems from '#databases/mergeDatabaseItems';
import openDatabase from '#databases/openDatabase';
import saveDatabase from '#databases/saveDatabase';
import SchemaNozzleError from '#errors/SchemaNozzleError';
import logger from '#tools/logger';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type TMasterToWorkerMessage from '#workers/interfaces/TMasterToWorkerMessage';
import type { TPickMasterToWorkerMessage } from '#workers/interfaces/TMasterToWorkerMessage';
import {
  isFailTaskComplete,
  isPassTaskComplete,
  type TPassWorkerToMasterTaskComplete,
  type TPickPassWorkerToMasterTaskComplete,
} from '#workers/interfaces/TWorkerToMasterMessage';
import workers from '#workers/workers';
import cluster from 'cluster';
import { atOrThrow, isError, populate } from 'my-easy-fp';
import os from 'os';

const log = logger();

export default async function refreshOnDatabaseCluster(baseOption: TRefreshSchemaBaseOption) {
  try {
    populate(os.cpus().length).forEach(() => workers.add(cluster.fork()));

    spinner.start('TypeScript source code compile, ...');

    const resolvedPaths = getResolvedPaths(baseOption);
    const option: TRefreshSchemaOption = {
      ...baseOption,
      ...resolvedPaths,
      discriminator: 'refresh-schema',
      files: [],
      generatorOptionObject: {},
    };

    option.generatorOptionObject = await getSchemaGeneratorOption(option);

    log.trace(`cwd: ${resolvedPaths.cwd}/${resolvedPaths.project}`);
    log.trace(`${JSON.stringify(option)}`);

    workers.sendAll({
      command: CE_WORKER_ACTION.OPTION_LOAD,
      data: { option: { ...option, project: option.project }, resolvedPaths },
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.OPTION_LOAD>);

    await workers.wait();

    workers.sendAll({
      command: CE_WORKER_ACTION.PROJECT_LOAD,
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.PROJECT_LOAD>);

    let reply = await workers.wait();

    log.trace(`reply::: ${JSON.stringify(reply)}`);

    // master check project loading on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new SchemaNozzleError(failReply.error);
    }

    workers.send({
      command: CE_WORKER_ACTION.PROJECT_DIAGONOSTIC,
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.PROJECT_DIAGONOSTIC>);

    reply = await workers.wait();

    // master check project diagostic on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new SchemaNozzleError(failReply.error);
    }

    spinner.update({ message: 'TypeScript project file loaded', channel: 'succeed' });
    spinner.start('schema file select, ...');

    workers.sendAll({
      command: CE_WORKER_ACTION.LOAD_DATABASE,
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.LOAD_DATABASE>);

    reply = await workers.wait();

    // master check project diagostic on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new SchemaNozzleError(failReply.error);
    }

    spinner.update({ message: 'schema file select complete', channel: 'succeed' });
    spinner.start('schema type select, ...');

    workers.send({
      command: CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES,
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES>);

    reply = await workers.wait();

    // master check schema file summary
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new SchemaNozzleError(failReply.error);
    }

    workers.send({
      command: CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES,
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES>);

    reply = await workers.wait();

    // master check schema type summary
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);

      const err = new Error(failReply.error.message);
      err.stack = failReply.error.stack;
      throw err;
    }

    const { data: exportedTypes } = atOrThrow(reply.data, 0) as TPickPassWorkerToMasterTaskComplete<
      typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES
    >;

    workers.sendAll({
      command: CE_WORKER_ACTION.GENERATOR_OPTION_LOAD,
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.GENERATOR_OPTION_LOAD }>);

    reply = await workers.wait();

    spinner.update({
      message: `${exportedTypes.length} schema type select complete`,
      channel: 'succeed',
    });
    spinner.stop();

    // master check generator option loading
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new SchemaNozzleError(failReply.error);
    }

    progress.start(exportedTypes.length, 0, '');

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

    reply = await workers.wait(option.generatorTimeout);

    progress.stop();

    const successes = reply.data.filter(isPassTaskComplete) as Extract<
      TPassWorkerToMasterTaskComplete,
      { command: typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA }
    >[];

    log.trace(`reply::: ${JSON.stringify(successes.map((items) => items.data).flat())}`);

    const db = await openDatabase(resolvedPaths);
    const newDb = mergeDatabaseItems(db, successes.map((item) => item.data).flat());

    await saveDatabase(option, newDb);

    workers.sendAll({ command: CE_WORKER_ACTION.TERMINATE });
  } catch (caught) {
    workers.sendAll({ command: CE_WORKER_ACTION.TERMINATE });
    const err = isError(caught, new Error('Unknown error raised'));
    spinner.stop({ message: err.message, channel: 'fail' });
    throw err;
  }
}
