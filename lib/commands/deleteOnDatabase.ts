import spinner from '@cli/spinner';
import getDiagnostics from '@compilers/getDiagnostics';
import getTsProject from '@compilers/getTsProject';
import getResolvedPaths from '@configs/getResolvedPaths';
import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import openDatabase from '@databases/openDatabase';
import saveDatabase from '@databases/saveDatabase';
import deleteSchemaRecord from '@modules/deleteSchemaRecord';
import getDeleteTypes from '@modules/getDeleteTypes';
import WorkerContainer from '@workers/WorkerContainer';
import fastCopy from 'fast-copy';
import { isError } from 'my-easy-fp';

export default async function deleteOnDatabase(
  nullableOption: IDeleteSchemaOption,
  isMessage?: boolean,
) {
  try {
    spinner.isEnable = isMessage ?? false;
    spinner.start('TypeScript source code compile, ...');

    const resolvedPaths = getResolvedPaths(nullableOption);
    const project = await getTsProject(resolvedPaths.project);
    if (project.type === 'fail') throw project.fail;

    spinner.update({ message: 'TypeScript source code compile success', channel: 'succeed' });

    const diagnostics = getDiagnostics({ option: nullableOption, project: project.pass });
    if (diagnostics.type === 'fail') throw diagnostics.fail;

    spinner.start('Open database, ...');
    const db = await openDatabase(resolvedPaths);
    spinner.update({ message: 'database open success', channel: 'succeed' });

    const targetTypes = await getDeleteTypes({ db, option: { ...nullableOption } });
    if (targetTypes.type === 'fail') throw targetTypes.fail;

    spinner.start(
      `Start [${targetTypes.pass.map((targetType) => `"${targetType}"`).join(', ')}] deletion...`,
    );

    const option: IDeleteSchemaOption = { ...nullableOption, types: targetTypes.pass };

    WorkerContainer.workers.forEach((worker) => {
      worker.send({ command: 'end' });
    });

    const newDb = targetTypes.pass.reduce((aggregation, typeName) => {
      const schemas = deleteSchemaRecord(aggregation, typeName);
      spinner.update({ message: `delete schema: ${typeName}`, channel: 'succeed' });
      return schemas;
    }, fastCopy(db));

    await saveDatabase(option, newDb);

    spinner.stop({
      message: `[${targetTypes.pass
        .map((targetType) => `"${targetType}"`)
        .join(', ')}] delete complete`,
      channel: 'succeed',
    });
  } catch (catched) {
    spinner.stop({ message: 'Error occured...', channel: 'fail' });
    const err = isError(catched) ?? new Error('Unknown error raised');
    throw err;
  }
}
