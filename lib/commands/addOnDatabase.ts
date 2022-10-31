import spinner from '@cli/spinner';
import getDiagnostics from '@compilers/getDiagnostics';
import getTsProject from '@compilers/getTsProject';
import getResolvedPaths from '@configs/getResolvedPaths';
import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import readGeneratorOption from '@configs/readGeneratorOption';
import openDatabase from '@databases/openDatabase';
import saveScheams from '@databases/saveScheams';
import getAddFiles from '@modules/getAddFiles';
import getAddTypes from '@modules/getAddTypes';
import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import mergeSchemaRecord from '@modules/mergeSchemaRecord';
import TParentToChildData from '@workers/interfaces/TParentToChildData';
import WorkerContainer from '@workers/WorkerContainer';
import { isError } from 'my-easy-fp';

export type TChaildToParentData =
  | { command: 'record'; data: IDatabaseRecord[] }
  | { command: 'message'; data: string };

export default async function addOnDatabase(
  nullableOption: IAddSchemaOption,
  isMessage?: boolean,
): Promise<void> {
  try {
    spinner.isEnable = isMessage ?? false;
    spinner.start('TypeScript source code compile, ...');

    const resolvedPaths = getResolvedPaths(nullableOption);
    const project = await getTsProject({
      tsConfigFilePath: resolvedPaths.project,
      skipAddingFilesFromTsConfig: false,
      skipFileDependencyResolution: true,
      skipLoadingLibFiles: true,
    });
    if (project.type === 'fail') throw project.fail;

    spinner.update({ message: 'TypeScript source code compile success', channel: 'succeed' });

    const files = await getAddFiles({ resolvedPaths, option: nullableOption });
    if (files.type === 'fail') throw files.fail;

    const diagnostics = getDiagnostics({ option: nullableOption, project: project.pass });
    if (diagnostics.type === 'fail') throw diagnostics.fail;

    const targetTypes = await getAddTypes({
      project: project.pass,
      option: { ...nullableOption, files: files.pass },
    });
    if (targetTypes.type === 'fail') throw targetTypes.fail;

    const option: IAddSchemaOption = {
      ...nullableOption,
      files: files.pass,
      types: targetTypes.pass.map((typeName) => typeName.typeName),
    };

    spinner.start('Open database, ...');

    const db = await openDatabase(resolvedPaths);
    const generatorOption = await readGeneratorOption(option);

    spinner.update({ message: 'database open success', channel: 'succeed' });

    spinner.start('Schema generation start, ...');

    const jobs = targetTypes.pass.map((typeInfo) => {
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
    await WorkerContainer.wait();

    const records = WorkerContainer.records.map((record) => mergeSchemaRecord(db, record));
    await saveScheams(option, db, ...records);

    spinner.stop({
      message: `[${targetTypes.pass
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
