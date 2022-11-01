import spinner from '@cli/spinner';
import getDiagnostics from '@compilers/getDiagnostics';
import getTsProject from '@compilers/getTsProject';
import getResolvedPaths from '@configs/getResolvedPaths';
import IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import readGeneratorOption from '@configs/readGeneratorOption';
import openDatabase from '@databases/openDatabase';
import saveDatabase from '@databases/saveDatabase';
import mergeSchemaRecords from '@modules/mergeSchemaRecords';
import TParentToChildData from '@workers/interfaces/TParentToChildData';
import WorkerContainer from '@workers/WorkerContainer';
import { isError, sleep } from 'my-easy-fp';

export default async function refreshOnDatabase(option: IRefreshSchemaOption, isMessage?: boolean) {
  try {
    spinner.isEnable = isMessage ?? false;
    spinner.start('TypeScript source code compile, ...');

    const resolvedPaths = getResolvedPaths(option);
    const project = await getTsProject({
      tsConfigFilePath: resolvedPaths.project,
      skipAddingFilesFromTsConfig: false,
      skipFileDependencyResolution: true,
      skipLoadingLibFiles: true,
    });
    if (project.type === 'fail') throw project.fail;
    spinner.update({ message: 'TypeScript source code compile success', channel: 'succeed' });

    const diagnostics = getDiagnostics({ option, project: project.pass });
    if (diagnostics.type === 'fail') throw diagnostics.fail;

    spinner.start('Open database, ...');
    const db = await openDatabase(resolvedPaths);
    spinner.update({ message: 'database open success', channel: 'succeed' });

    const targetTypes = Object.values(db).map((record) => {
      return {
        filePath: record.filePath,
        typeName: record.id,
      };
    });

    const generatorOption = await readGeneratorOption(option);
    spinner.start('Schema generation start, ...');

    const jobs = targetTypes.map((typeInfo) => {
      const payload: TParentToChildData = {
        command: 'job',
        data: {
          fileWithTypes: typeInfo,
          option,
          resolvedPaths,
          generatorOption,
        },
      };

      return payload;
    });

    if (jobs.length > WorkerContainer.workers.length) {
      jobs.forEach((job, index) => {
        WorkerContainer.workers[index % WorkerContainer.workers.length].send(job);
      });
    } else {
      WorkerContainer.workers.forEach((worker, index) => {
        if (jobs.length > index) {
          worker.send(jobs[index]);
        } else {
          worker.send({ command: 'end' });
        }
      });
    }

    WorkerContainer.workers.forEach((worker) => worker.send({ command: 'start' }));

    sleep(20);

    await WorkerContainer.wait();

    const newDb = mergeSchemaRecords(db, WorkerContainer.records);

    await saveDatabase(option, newDb);

    spinner.stop({
      message: `[${targetTypes
        .map((targetType) => `"${targetType.typeName}"`)
        .join(', ')}] add complete`,
      channel: 'succeed',
    });
  } catch (catched) {
    spinner.stop({ message: 'Error occured...', channel: 'fail' });
    const err = isError(catched) ?? new Error('Unknown error raised');
    throw err;
  }
}
