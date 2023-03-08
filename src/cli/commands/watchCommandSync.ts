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
import type TUpdateEvent from '#modules/interfaces/TUpdateEvent';
import WatcherModule from '#modules/WatcherModule';
import logger from '#tools/logger';
import { showLogo } from '@maeum/cli-logo';
import chalk from 'chalk';
import chokidar from 'chokidar';
import { isError } from 'my-easy-fp';
import { debounceTime, Subject } from 'rxjs';

const log = logger();

export default async function watchCommandSync(baseOption: TWatchSchemaBaseOption) {
  if (baseOption.cliLogo) {
    await showLogo({
      message: 'Schema Nozzle',
      figlet: { font: 'ANSI Shadow', width: 80 },
      color: 'cyan',
    });
  } else {
    spinner.start('Schema Nozzle start');
    spinner.update('Schema Nozzle start', 'info');
    spinner.stop();
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

  spinner.update('TypeScript project file loaded', 'succeed');
  spinner.update(`Watch project: ${option.project}`, 'info');

  const wm = new WatcherModule({
    project: project.pass,
    exportTypes: projectExportedTypes,
    option,
  });

  const watchHandle = chokidar.watch(watchFiles, { cwd: option.cwd, ignoreInitial: true });

  const addSubject = new Subject<IWatchEvent>();
  const changeSubject = new Subject<IWatchEvent>();
  const unlinkSubject = new Subject<IWatchEvent>();
  const updateSubject = new Subject<TUpdateEvent>();

  updateSubject.subscribe((event) => {
    if (event.kind === CE_WATCH_EVENT.UNLINK) {
      wm.deleteDatabase(event.exportedTypes)
        .then(() => {
          spinner.update(`delete exported type: ${event.exportedTypes.join(', ')}`, 'succeed');
          spinner.stop();
        })
        .catch((caught) => {
          const err = isError(caught, new Error('unknown error raised'));
          spinner.update(`delete exported type: ${err.message}`, 'fail');
          spinner.stop();
        });
    } else {
      wm.updateDatabase(event.items)
        .then(() => {
          spinner.update(
            `${event.kind} exported type: ${event.items.map((item) => item.id).join(', ')}`,
            'succeed',
          );
          spinner.stop();
        })
        .catch((caught) => {
          const err = isError(caught, new Error('unknown error raised'));
          spinner.update(`${event.kind} exported type: ${err.message}`, 'fail');
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
