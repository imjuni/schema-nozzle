import spinner from '#cli/display/spinner';
import getDiagnostics from '#compilers/getDiagnostics';
import getTsProject from '#compilers/getTsProject';
import getResolvedPaths from '#configs/getResolvedPaths';
import type TDeleteSchemaOption from '#configs/interfaces/TDeleteSchemaOption';
import deleteDatabaseItem from '#databases/deleteDatabaseItem';
import openDatabase from '#databases/openDatabase';
import saveDatabase from '#databases/saveDatabase';
import getDeleteTypes from '#modules/getDeleteTypes';
import fastCopy from 'fast-copy';
import { isError } from 'my-easy-fp';

export default async function deleteOnDatabase(nullableOption: TDeleteSchemaOption) {
  try {
    spinner.start('TypeScript project loading, ...');

    const resolvedPaths = getResolvedPaths(nullableOption);
    const project = await getTsProject({
      tsConfigFilePath: resolvedPaths.project,
      skipAddingFilesFromTsConfig: false,
      skipFileDependencyResolution: true,
      skipLoadingLibFiles: true,
    });
    if (project.type === 'fail') throw project.fail;

    spinner.update({ message: 'TypeScript project load success', channel: 'succeed' });

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

    const option: TDeleteSchemaOption = { ...nullableOption, types: targetTypes.pass };

    if (targetTypes.pass.length === Object.keys(db).length) {
      await saveDatabase(option, {});

      spinner.stop({
        message: `[${targetTypes.pass
          .map((targetType) => `"${targetType}"`)
          .join(', ')}] delete complete`,
        channel: 'succeed',
      });

      return;
    }

    const newDb = targetTypes.pass.reduce((aggregation, identifier) => {
      const schemas = deleteDatabaseItem(aggregation, identifier);
      spinner.update({ message: `delete schema: ${identifier}`, channel: 'succeed' });
      return schemas;
    }, fastCopy(db));

    await saveDatabase(option, newDb);

    spinner.stop({
      message: `[${targetTypes.pass
        .map((targetType) => `"${targetType}"`)
        .join(', ')}] delete complete`,
      channel: 'succeed',
    });
  } catch (caught) {
    spinner.stop({ message: 'Error occured...', channel: 'fail' });
    const err = isError(caught) ?? new Error('Unknown error raised');
    throw err;
  }
}
