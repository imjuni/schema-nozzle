import spinner from '@cli/spinner';
import getDiagnostics from '@compilers/getDiagnostics';
import getTsProject from '@compilers/getTsProject';
import getResolvedPaths from '@configs/getResolvedPaths';
import type IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import readGeneratorOption from '@configs/readGeneratorOption';
import openDatabase from '@databases/openDatabase';
import saveDatabase from '@databases/saveDatabase';
import type IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import mergeSchemaRecords from '@modules/mergeSchemaRecords';
import type TMasterToWorkerMessage from '@workers/interfaces/TMasterToWorkerMessage';
import WorkerContainer from '@workers/WorkerContainer';
import cluster from 'cluster';
import { isError, populate } from 'my-easy-fp';
import { getDirname } from 'my-node-fp';
import os from 'os';
import path from 'path';
import type { SetRequired } from 'type-fest';

export default async function refreshOnDatabaseCluster(
  option: IRefreshSchemaOption,
  isMessage?: boolean,
) {
  try {
    populate(os.cpus().length).forEach(() => {
      WorkerContainer.add(cluster.fork());
    });

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

    const basePath = await getDirname(resolvedPaths.project);
    const targetTypes = Object.values(db)
      .filter(
        (record): record is SetRequired<IDatabaseRecord, 'filePath'> => record.filePath != null,
      )
      .map((record) => {
        return {
          filePath: path.join(basePath, record.filePath),
          typeName: record.id,
        };
      });

    const generatorOption = await readGeneratorOption(option);

    spinner.start('Schema generation start, ...');

    const jobs = targetTypes.map((typeInfo) => {
      const payload: TMasterToWorkerMessage = {
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

    WorkerContainer.send(...jobs);
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
