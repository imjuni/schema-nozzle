import { showLogo } from '@maeum/cli-logo';
import { atOrThrow, isError, populate, sleep } from 'my-easy-fp';
import { exists } from 'my-node-fp';
import cluster from 'node:cluster';
import fs from 'node:fs';
import os from 'node:os';
import progress from 'src/cli/display/progress';
import showFailMessage from 'src/cli/display/showFailMessage';
import spinner from 'src/cli/display/spinner';
import getResolvedPaths from 'src/configs/getResolvedPaths';
import getSchemaGeneratorOption from 'src/configs/getSchemaGeneratorOption';
import type TRefreshSchemaOption from 'src/configs/interfaces/TRefreshSchemaOption';
import type { TRefreshSchemaBaseOption } from 'src/configs/interfaces/TRefreshSchemaOption';
import getDatabaseFilePath from 'src/databases/getDatabaseFilePath';
import mergeDatabaseItems from 'src/databases/mergeDatabaseItems';
import openDatabase from 'src/databases/openDatabase';
import saveDatabase from 'src/databases/saveDatabase';
import SchemaNozzleError from 'src/errors/SchemaNozzleError';
import createJSONSchemaCommand from 'src/modules/createJSONSchemaCommand';
import logger from 'src/tools/logger';
import { CE_WORKER_ACTION } from 'src/workers/interfaces/CE_WORKER_ACTION';
import type { TPickMasterToWorkerMessage } from 'src/workers/interfaces/TMasterToWorkerMessage';
import {
  isFailTaskComplete,
  isPassTaskComplete,
  type TPassWorkerToMasterTaskComplete,
  type TPickPassWorkerToMasterTaskComplete,
} from 'src/workers/interfaces/TWorkerToMasterMessage';
import workers from 'src/workers/workers';

const log = logger();

export default async function refreshCommandCluster(baseOption: TRefreshSchemaBaseOption) {
  try {
    if (baseOption.cliLogo) {
      await showLogo({
        message: 'Schema Nozzle',
        figlet: { font: 'ANSI Shadow', width: 80 },
        color: 'cyan',
      });
    } else {
      spinner.start('Schema Nozzle start');
      spinner.stop('Schema Nozzle start', 'info');
    }

    const workerSize = baseOption.maxWorkers ?? os.cpus().length - 1;
    populate(workerSize).forEach(() => workers.add(cluster.fork()));

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

    workers.broadcast({
      command: CE_WORKER_ACTION.OPTION_LOAD,
      data: { option },
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.OPTION_LOAD>);

    await workers.wait();

    workers.broadcast({
      command: CE_WORKER_ACTION.PROJECT_LOAD,
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.PROJECT_LOAD>);

    let reply = await workers.wait(option.generatorTimeout);

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

    spinner.stop('TypeScript project file loaded', 'succeed');

    const dbPath = await getDatabaseFilePath(option);
    if ((option.truncate ?? false) && (await exists(dbPath))) {
      spinner.start('database file truncate, ...');
      await fs.promises.unlink(dbPath);
      await sleep(200);
      spinner.stop('database file truncated', 'succeed');
    }

    spinner.start('schema file select, ...');

    workers.broadcast({
      command: CE_WORKER_ACTION.LOAD_DATABASE,
    } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.LOAD_DATABASE>);

    reply = await workers.wait();

    // master check project diagostic on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new SchemaNozzleError(failReply.error);
    }

    spinner.stop('schema file select complete', 'succeed');
    spinner.start('schema type select, ...');

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
      typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES
    >;

    spinner.stop(`${exportedTypes.length} schema type select complete`, 'succeed');

    // master check generator option loading
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new SchemaNozzleError(failReply.error);
    }

    const generationCommands = createJSONSchemaCommand(workerSize, exportedTypes);

    progress.start(exportedTypes.length, 0, '');
    workers.send(...generationCommands);

    reply = await workers.wait(option.generatorTimeout);

    progress.stop();

    const passes = reply.data.filter(isPassTaskComplete);

    workers.broadcast({ command: CE_WORKER_ACTION.TERMINATE });

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

    const fails = reply.data.filter(isFailTaskComplete);
    showFailMessage(fails.map((fail) => fail.error));
  } catch (caught) {
    workers.broadcast({ command: CE_WORKER_ACTION.TERMINATE });

    const err = isError(caught, new Error('Unknown error raised'));
    spinner.stop(err.message, 'fail');

    throw err;
  }
}
