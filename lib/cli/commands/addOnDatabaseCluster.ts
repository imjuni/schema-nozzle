import spinner from '#cli/display/spinner';
import getDiagnostics from '#compilers/getDiagnostics';
import getTsProject from '#compilers/getTsProject';
import getResolvedPaths from '#configs/getResolvedPaths';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import readGeneratorOption from '#configs/readGeneratorOption';
import openDatabase from '#databases/openDatabase';
import saveDatabase from '#databases/saveDatabase';
import getAddFiles from '#modules/getAddFiles';
import getAddTypes from '#modules/getAddTypes';
import mergeSchemaRecords from '#modules/mergeSchemaRecords';
import type TMasterToWorkerMessage from '#workers/interfaces/TMasterToWorkerMessage';
import workers from '#workers/workers';
import cluster from 'cluster';
import { isError, populate } from 'my-easy-fp';
import os from 'os';

export default async function addOnDatabaseCluster(
  nullableOption: TAddSchemaOption,
): Promise<void> {
  try {
    populate(os.cpus().length).forEach(() => {
      workers.add(cluster.fork());
    });

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

    const option: TAddSchemaOption = {
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

    workers.send(...jobs);
    await workers.wait();

    const newDb = mergeSchemaRecords(db, workers.records);
    await saveDatabase(option, newDb);

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
