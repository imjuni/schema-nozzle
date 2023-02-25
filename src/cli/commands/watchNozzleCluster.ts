/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import spinner from '#cli/display/spinner';
import getResolvedPaths from '#configs/getResolvedPaths';
import getSchemaGeneratorOption from '#configs/getSchemaGeneratorOption';
import type TWatchSchemaOption from '#configs/interfaces/TWatchSchemaOption';
import type { TWatchSchemaBaseOption } from '#configs/interfaces/TWatchSchemaOption';
import SchemaNozzleError from '#errors/SchemaNozzleError';
import errorTrace from '#modules/errorTrace';
import getWatchFiles from '#modules/getWatchFiles';
import { CE_WATCH_EVENT } from '#modules/interfaces/CE_WATCH_EVENT';
import type IWatchEvent from '#modules/interfaces/IWatchEvent';
import type TUpdateEvent from '#modules/interfaces/TUpdateEvent';
import WatcherClusterModule from '#modules/WatcherClusterModule';
import logger from '#tools/logger';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type { TPickMasterToWorkerMessage } from '#workers/interfaces/TMasterToWorkerMessage';
import { isFailTaskComplete } from '#workers/interfaces/TWorkerToMasterMessage';
import workers from '#workers/workers';
import { showLogo } from '@maeum/cli-logo';
import chalk from 'chalk';
import chokidar from 'chokidar';
import cluster from 'cluster';
import { atOrThrow, isError, populate } from 'my-easy-fp';
import os from 'os';
import { debounceTime, Subject } from 'rxjs';

const log = logger();

export default async function watchNozzleCluster(baseOption: TWatchSchemaBaseOption) {
  if (baseOption.cliLogo) {
    await showLogo({
      message: 'Schema Nozzle',
      figlet: { font: 'ANSI Shadow', width: 80 },
      color: 'cyan',
    });
  } else {
    spinner.start('Schema Nozzle start');
    spinner.update({ message: 'Schema Nozzle start', channel: 'info' });
    spinner.stop();
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
  const watchFiles = getWatchFiles(option);

  log.trace(`${option.debounceTime}, ${watchFiles.join(', ')}`);

  workers.sendAll({
    command: CE_WORKER_ACTION.OPTION_LOAD,
    data: { option: { ...option, project: option.project } },
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
  spinner.update({ message: `Watch project: ${option.project}`, channel: 'info' });
  spinner.stop();

  const wm = new WatcherClusterModule({ option });

  const watchHandle = chokidar.watch(watchFiles, { cwd: option.cwd, ignoreInitial: true });

  const addSubject = new Subject<IWatchEvent>();
  const changeSubject = new Subject<IWatchEvent>();
  const unlinkSubject = new Subject<IWatchEvent>();
  const updateSubject = new Subject<TUpdateEvent>();

  updateSubject.subscribe((event) => {
    if (event.kind === CE_WATCH_EVENT.UNLINK) {
      wm.deleteDatabase(event.exportedTypes)
        .then(() => {
          spinner.update({
            message: `delete exported type: ${event.exportedTypes.join(', ')}`,
            channel: 'succeed',
          });
          spinner.stop();
        })
        .catch((caught) => {
          const err = isError(caught, new Error('unknown error raised'));
          spinner.update({
            message: `delete exported type: ${err.message}`,
            channel: 'fail',
          });
          spinner.stop();
        });
    } else {
      wm.updateDatabase(event.items)
        .then(() => {
          spinner.update({
            message: `${event.kind} exported type: ${event.items
              .map((item) => item.id)
              .join(', ')}`,
            channel: 'succeed',
          });
          spinner.stop();
        })
        .catch((caught) => {
          const err = isError(caught, new Error('unknown error raised'));
          spinner.update({
            message: `${event.kind} exported type: ${err.message}`,
            channel: 'fail',
          });
          spinner.stop();
        });
    }
  });

  addSubject.pipe(debounceTime(option.debounceTime)).subscribe((change) => {
    spinner.start(`${chalk.greenBright('add')}: ${change.filePath}`);

    wm.add(change)
      .then((items) => updateSubject.next({ kind: CE_WATCH_EVENT.ADD, items }))
      .catch(errorTrace);
  });

  changeSubject.pipe(debounceTime(option.debounceTime)).subscribe((change) => {
    spinner.start(`${chalk.greenBright('change')}: ${change.filePath}`);

    wm.change(change)
      .then((items) => updateSubject.next({ kind: CE_WATCH_EVENT.CHANGE, items }))
      .catch(errorTrace);
  });

  unlinkSubject.pipe(debounceTime(option.debounceTime)).subscribe((change) => {
    spinner.start(`${chalk.yellowBright('unlink')}: ${change.filePath}`);

    wm.unlink(change)
      .then((exportedTypes) => updateSubject.next({ kind: CE_WATCH_EVENT.UNLINK, exportedTypes }))
      .catch(errorTrace);
  });

  watchHandle
    .on('add', (filePath) => addSubject.next({ kind: 'add', filePath }))
    .on('change', (filePath) => changeSubject.next({ kind: 'change', filePath }))
    .on('unlink', (filePath) => unlinkSubject.next({ kind: 'unlink', filePath }));
}
