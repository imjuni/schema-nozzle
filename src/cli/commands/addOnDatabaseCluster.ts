import progress from '#cli/display/progress';
import showFailMessage from '#cli/display/showFailMessage';
import spinner from '#cli/display/spinner';
import getResolvedPaths from '#configs/getResolvedPaths';
import getSchemaGeneratorOption from '#configs/getSchemaGeneratorOption';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type { TAddSchemaBaseOption } from '#configs/interfaces/TAddSchemaOption';
import mergeDatabaseItems from '#databases/mergeDatabaseItems';
import openDatabase from '#databases/openDatabase';
import saveDatabase from '#databases/saveDatabase';
import SchemaNozzleError from '#errors/SchemaNozzleError';
import getAddFiles from '#modules/getAddFiles';
import getAddTypes from '#modules/getAddTypes';
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

export default async function addOnDatabaseCluster(
  baseOption: TAddSchemaBaseOption,
): Promise<void> {
  try {
    const workerSize = baseOption.maxWorkers ?? os.cpus().length - 1;
    populate(workerSize).forEach(() => workers.add(cluster.fork()));

    spinner.start('TypeScript project loading, ...');

    const resolvedPaths = getResolvedPaths(baseOption);
    const option: TAddSchemaOption = {
      ...baseOption,
      ...resolvedPaths,
      discriminator: 'add-schema',
      generatorOptionObject: {},
    };

    option.generatorOptionObject = await getSchemaGeneratorOption(option);

    log.trace(`cwd: ${resolvedPaths.cwd}/${resolvedPaths.project}`);
    log.trace(`${JSON.stringify(option)}`);

    workers.sendAll({
      command: CE_WORKER_ACTION.OPTION_LOAD,
      data: { option },
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.OPTION_LOAD }>);

    await workers.wait();

    workers.sendAll({
      command: CE_WORKER_ACTION.PROJECT_LOAD,
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.PROJECT_LOAD }>);

    let reply = await workers.wait();

    // master check project loading on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new SchemaNozzleError(failReply.error);
    }

    spinner.update({ message: 'TypeScript project load success', channel: 'succeed' });

    workers.send({
      command: CE_WORKER_ACTION.PROJECT_DIAGONOSTIC,
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.PROJECT_DIAGONOSTIC }>);

    reply = await workers.wait();

    // master check project diagostic on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new SchemaNozzleError(failReply.error);
    }

    workers.send({
      command: CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES,
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES }>);

    reply = await workers.wait();

    // master check schema file summary
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new SchemaNozzleError(failReply.error);
    }

    const { data: schemaFiles } = atOrThrow(reply.data, 0) as Extract<
      TPassWorkerToMasterTaskComplete,
      { command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES; result: 'pass' }
    >;

    const selectedSchemaFiles = await getAddFiles(option, schemaFiles);
    if (selectedSchemaFiles.type === 'fail') throw selectedSchemaFiles.fail;
    option.files = selectedSchemaFiles.pass.map((filePath) => filePath.origin);

    workers.sendAll({
      command: CE_WORKER_ACTION.OPTION_LOAD,
      data: { option },
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.OPTION_LOAD }>);

    await workers.wait();

    workers.sendAll({
      command: CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES,
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES }>);

    reply = await workers.wait();

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

    const { data: exportedTypes } = atOrThrow(reply.data, 0) as Extract<
      TPassWorkerToMasterTaskComplete,
      { command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES; result: 'pass' }
    >;

    const selectedTypes = await getAddTypes(option, exportedTypes);
    if (selectedTypes.type === 'fail') throw selectedTypes.fail;
    option.types = selectedTypes.pass.map((exportedType) => exportedType.identifier);

    workers.sendAll({
      command: CE_WORKER_ACTION.OPTION_LOAD,
      data: { option },
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.OPTION_LOAD }>);

    workers.sendAll({
      command: CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES,
    } satisfies Extract<TMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES }>);

    reply = await workers.wait();

    workers.sendAll({
      command: CE_WORKER_ACTION.OPTION_LOAD,
      data: { option },
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.OPTION_LOAD>);

    await workers.wait();

    // master check generator option loading
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new SchemaNozzleError(failReply.error);
    }

    progress.start(exportedTypes.length, 0, exportedTypes[0].identifier);

    workers.send(
      ...exportedTypes.map((exportedType) => {
        return {
          command: CE_WORKER_ACTION.CREATE_JSON_SCHEMA,
          data: { exportedType: exportedType.identifier, filePath: exportedType.filePath },
        } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA>;
      }),
    );

    reply = await workers.wait(option.generatorTimeout);

    progress.stop();

    const passes = reply.data.filter(isPassTaskComplete);

    workers.sendAll({ command: CE_WORKER_ACTION.TERMINATE });

    if (atOrThrow(passes, 0).command === CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK) {
      const pass = passes as Extract<
        TPassWorkerToMasterTaskComplete,
        { command: typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK }
      >[];
      const db = await openDatabase(resolvedPaths);
      const newDb = mergeDatabaseItems(db, pass.map((item) => item.data.pass).flat());

      await saveDatabase(option, newDb);
    } else {
      log.trace(`reply::: ${JSON.stringify(passes.map((items) => items.data).flat())}`);

      const items = passes as TPickPassWorkerToMasterTaskComplete<
        typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA
      >[];
      const db = await openDatabase(resolvedPaths);
      const newDb = mergeDatabaseItems(db, items.map((item) => item.data).flat());

      await saveDatabase(option, newDb);
    }

    const fails = reply.data.filter(isFailTaskComplete);
    showFailMessage(fails.map((fail) => fail.error));
  } catch (caught) {
    const err = isError(caught) ?? new Error('Unknown error raised');
    spinner.stop({ message: err.message, channel: 'fail' });
    throw err;
  }
}
