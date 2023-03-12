/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import spinner from '#cli/display/spinner';
import getDiagnostics from '#compilers/getDiagnostics';
import getExportedTypes from '#compilers/getExportedTypes';
import getTsProject from '#compilers/getTsProject';
import getResolvedPaths from '#configs/getResolvedPaths';
import getSchemaGeneratorOption from '#configs/getSchemaGeneratorOption';
import type TWatchSchemaOption from '#configs/interfaces/TWatchSchemaOption';
import type { TWatchSchemaBaseOption } from '#configs/interfaces/TWatchSchemaOption';
import errorTrace from '#modules/errorTrace';
import getWatchFiles from '#modules/getWatchFiles';
import { CE_WATCH_EVENT } from '#modules/interfaces/CE_WATCH_EVENT';
import type IWatchEvent from '#modules/interfaces/IWatchEvent';
import WatcherModule from '#modules/WatcherModule';
import logger from '#tools/logger';
import { showLogo } from '@maeum/cli-logo';
import chokidar from 'chokidar';
import fastCopy from 'fast-copy';
import { buffer, debounceTime, Subject } from 'rxjs';
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';

const log = logger();

export default async function watchCommandSync(baseOption: TWatchSchemaBaseOption) {
  if (baseOption.cliLogo) {
    await showLogo({
      message: 'Schema Nozzle',
      figlet: { font: 'ANSI Shadow', width: 80 },
      color: 'cyan',
    });
  } else {
    spinner.start('Schema Nozzle start').stop('Schema Nozzle start', 'info');
  }

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

  const project = await getTsProject({ tsConfigFilePath: option.project });
  if (project.type === 'fail') throw project.fail;

  const projectExportedTypes = getExportedTypes(project.pass);
  const diagnostics = getDiagnostics({ option, project: project.pass });
  if (diagnostics.type === 'fail') throw diagnostics.fail;
  if (diagnostics.pass === false) throw new Error('project compile error');

  spinner.stop('TypeScript project file loaded', 'succeed');
  spinner.stop(`Watch project: ${option.project}`, 'info');

  const wm = new WatcherModule({
    project: project.pass,
    exportTypes: projectExportedTypes,
    option,
  });

  const watchHandle = chokidar.watch(watchFiles, { cwd: option.cwd, ignoreInitial: true });

  const updateProjectSubject = new Subject<IWatchEvent>();
  const updateDbSubject = new Subject<IWatchEvent[]>();
  const debounceObserable = updateProjectSubject.pipe(debounceTime(option.debounceTime));

  updateDbSubject.subscribe((events) => {
    wm.bulk(events).catch(errorTrace);
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