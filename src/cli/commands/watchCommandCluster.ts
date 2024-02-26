/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { spinner } from '#/cli/display/spinner';
import { getResolvedPaths } from '#/configs/getResolvedPaths';
import { getSchemaGeneratorOption } from '#/configs/getSchemaGeneratorOption';
import type {
  TWatchSchemaBaseOption,
  TWatchSchemaOption,
} from '#/configs/interfaces/TWatchSchemaOption';
import { SchemaNozzleError } from '#/errors/SchemaNozzleError';
import { errorTrace } from '#/modules/errorTrace';
import { getWatchFiles } from '#/modules/getWatchFiles';
import { CE_WATCH_EVENT } from '#/modules/interfaces/CE_WATCH_EVENT';
import type { IWatchEvent } from '#/modules/interfaces/IWatchEvent';
import { WatcherClusterModule } from '#/modules/WatcherClusterModule';
import { CE_WORKER_ACTION } from '#/workers/interfaces/CE_WORKER_ACTION';
import type { TPickMasterToWorkerMessage } from '#/workers/interfaces/TMasterToWorkerMessage';
import {
  isFailTaskComplete,
  type TPassWorkerToMasterTaskComplete,
} from '#/workers/interfaces/TWorkerToMasterMessage';
import { workers } from '#/workers/workers';
import { showLogo } from '@maeum/cli-logo';
import chokidar from 'chokidar';
import consola from 'consola';
import fastCopy from 'fast-copy';
import { atOrThrow, populate } from 'my-easy-fp';
import cluster from 'node:cluster';
import os from 'os';
import { buffer, debounceTime, filter, Subject } from 'rxjs';
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';

export async function watchCommandCluster(baseOption: TWatchSchemaBaseOption) {
  if (baseOption.cliLogo) {
    await showLogo({
      message: 'Schema Nozzle',
      figlet: { font: 'ANSI Shadow', width: 80 },
      color: 'cyan',
    });
  } else {
    spinner.start('Schema Nozzle start').stop('Schema Nozzle start', 'info');
  }

  const workerSize = baseOption.maxWorkers ?? os.cpus().length - 1;
  populate(workerSize).forEach(() => workers.add(cluster.fork()));

  spinner.start('TypeScript source code compile, ...');

  const resolvedPaths = getResolvedPaths(baseOption);
  const option: TWatchSchemaOption = {
    ...baseOption,
    ...resolvedPaths,
    discriminator: 'watch-schema',
    files: [],
    generatorOptionObject: {},
  };

  option.generatorOptionObject = await getSchemaGeneratorOption(option);

  workers.broadcast({
    command: CE_WORKER_ACTION.OPTION_LOAD,
    data: { option },
  } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.OPTION_LOAD>);

  await workers.wait();

  workers.broadcast({
    command: CE_WORKER_ACTION.PROJECT_LOAD,
  } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.PROJECT_LOAD>);

  let reply = await workers.wait();

  consola.trace(`reply::: ${JSON.stringify(reply)}`);

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

  spinner
    .start(`Watch project: ${option.project}`)
    .stop(`Watch project: ${option.project}`, 'info');

  workers.broadcast({
    command: CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES,
  } satisfies TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES>);

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

  const watchFiles = await getWatchFiles(schemaFiles, option);

  consola.trace(`WatchFile: ${option.debounceTime}, ${watchFiles.join(', ')}`);

  const wm = new WatcherClusterModule({ option, workerSize });
  const watchHandle = chokidar.watch(watchFiles, { cwd: option.cwd, ignoreInitial: true });
  const updateProjectSubject = new Subject<IWatchEvent>();
  const updateDbSubject = new Subject<IWatchEvent[]>();
  const debounceObserable = updateProjectSubject.pipe(debounceTime(option.debounceTime));

  let lock: boolean = false;

  updateDbSubject.pipe(filter((events) => events.length > 0)).subscribe((events) => {
    new Promise<void>((resolve) => {
      const intervalHandle = setInterval(() => {
        if (!lock) {
          clearInterval(intervalHandle);
          resolve();
        }

        consola.trace('wait, wait ...');
      }, 100);
    })
      .then(() => {
        lock = true;
        wm.bulk(events).catch(errorTrace);
        lock = false;
      })
      .catch(errorTrace);
  });

  updateProjectSubject.pipe(buffer(debounceObserable)).subscribe((events) => {
    const eventQueue = fastCopy(events);

    new Promise<void>((resolve) => {
      const intervalHandle = setIntervalAsync(async () => {
        const event = eventQueue.shift();

        if (event == null) {
          await clearIntervalAsync(intervalHandle);
          resolve();
          return;
        }

        if (event.kind === CE_WATCH_EVENT.UNLINK) {
          await wm.unlink(event);
        } else if (event.kind === CE_WATCH_EVENT.CHANGE) {
          await wm.change(event);
        } else {
          await wm.add(event);
        }
      }, 50);
    })
      .then(() => {
        updateDbSubject.next(events);
      })
      .catch(errorTrace);
  });

  watchHandle
    .on('add', (filePath) => updateProjectSubject.next({ kind: 'add', filePath }))
    .on('change', (filePath) => updateProjectSubject.next({ kind: 'change', filePath }))
    .on('unlink', (filePath) => updateProjectSubject.next({ kind: 'unlink', filePath }));
}
