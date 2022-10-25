import spinner from '@cli/spinner';
import getDiagnostics from '@compilers/getDiagnostics';
import getTsProject from '@compilers/getTsProject';
import getResolvedPaths from '@configs/getResolvedPaths';
import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import openDatabase from '@databases/openDatabase';
import saveDatabase from '@databases/saveDatabase';
import deleteSchemaRecord from '@modules/deleteSchemaRecord';
import getDeleteTypes from '@modules/getDeleteTypes';
import fastCopy from 'fast-copy';
import { isError } from 'my-easy-fp';

export default async function deleteOnDatabase(
  nullableOption: IDeleteSchemaOption,
  isMessage?: boolean,
) {
  try {
    spinner.isEnable = isMessage ?? false;

    const resolvedPaths = getResolvedPaths(nullableOption);
    const db = await openDatabase(resolvedPaths);

    const project = await getTsProject(resolvedPaths.project);

    if (project.type === 'fail') throw project.fail;

    const diagnostics = getDiagnostics({ option: nullableOption, project: project.pass });

    if (diagnostics.type === 'fail') throw diagnostics.fail;

    const targetTypes = await getDeleteTypes({ db, option: { ...nullableOption } });

    if (targetTypes.type === 'fail') throw targetTypes.fail;

    spinner.start(
      `Start [${targetTypes.pass.map((targetType) => `"${targetType}"`).join(', ')}] deletion...`,
    );

    const option: IDeleteSchemaOption = { ...nullableOption, types: targetTypes.pass };

    const newDb = targetTypes.pass.reduce((aggregation, typeName) => {
      const schemas = deleteSchemaRecord(aggregation, typeName);
      spinner.update({ message: `delete schema: ${typeName}`, channel: 'info' });
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
