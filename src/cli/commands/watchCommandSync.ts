/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { showLogo } from '@maeum/cli-logo';
import chokidar from 'chokidar';
import fastCopy from 'fast-copy';
import { buffer, debounceTime, Subject } from 'rxjs';
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';
import spinner from 'src/cli/display/spinner';
import getDiagnostics from 'src/compilers/getDiagnostics';
import getExportedTypes from 'src/compilers/getExportedTypes';
import getTsProject from 'src/compilers/getTsProject';
import getResolvedPaths from 'src/configs/getResolvedPaths';
import getSchemaGeneratorOption from 'src/configs/getSchemaGeneratorOption';
import type TWatchSchemaOption from 'src/configs/interfaces/TWatchSchemaOption';
import type { TWatchSchemaBaseOption } from 'src/configs/interfaces/TWatchSchemaOption';
import errorTrace from 'src/modules/errorTrace';
import getWatchFiles from 'src/modules/getWatchFiles';
import { CE_WATCH_EVENT } from 'src/modules/interfaces/CE_WATCH_EVENT';
import type IWatchEvent from 'src/modules/interfaces/IWatchEvent';
import WatcherModule from 'src/modules/WatcherModule';
import getRelativeCwd from 'src/tools/getRelativeCwd';
import logger from 'src/tools/logger';

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

  const project = await getTsProject({ tsConfigFilePath: option.project });
  const projectExportedTypes = getExportedTypes(project);
  const diagnostics = getDiagnostics({ option, project });

  if (diagnostics.type === 'fail') throw diagnostics.fail;
  if (diagnostics.pass === false) throw new Error('project compile error');

  spinner.stop('TypeScript project file loaded', 'succeed');
  spinner
    .start(`Watch project: ${option.project}`)
    .stop(`Watch project: ${option.project}`, 'info');

  const watchFiles = await getWatchFiles(
    projectExportedTypes.map((projectExportedType) => ({
      origin: projectExportedType.filePath,
      refined: getRelativeCwd(option.cwd, projectExportedType.filePath),
    })),
    option,
  );

  log.trace(`${option.debounceTime}, ${watchFiles.join(', ')}`);

  const wm = new WatcherModule({ project, exportTypes: projectExportedTypes, option });

  const watchHandle = chokidar.watch(watchFiles, { cwd: option.cwd, ignoreInitial: true });

  const updateProjectSubject = new Subject<IWatchEvent>();
  const updateDbSubject = new Subject<IWatchEvent[]>();
  const debounceObserable = updateProjectSubject.pipe(debounceTime(option.debounceTime));

  let lock: boolean = false;

  updateDbSubject.subscribe((events) => {
    new Promise<void>((resolve) => {
      const intervalHandle = setInterval(() => {
        if (!lock) {
          clearInterval(intervalHandle);
          resolve();
        }

        log.trace('wait, wait ...');
      }, 100);
    })
      .then(() => {
        lock = true;

        wm.bulk(events)
          .then(() => {
            lock = false;
          })
          .catch(() => {
            lock = false;
          });
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
