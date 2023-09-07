import { showLogo } from '@maeum/cli-logo';
import fastCopy from 'fast-copy';
import { isError } from 'my-easy-fp';
import spinner from 'src/cli/display/spinner';
import getDiagnostics from 'src/compilers/getDiagnostics';
import getTsProject from 'src/compilers/getTsProject';
import getResolvedPaths from 'src/configs/getResolvedPaths';
import type TDeleteSchemaOption from 'src/configs/interfaces/TDeleteSchemaOption';
import deleteDatabaseItem from 'src/databases/deleteDatabaseItem';
import openDatabase from 'src/databases/openDatabase';
import saveDatabase from 'src/databases/saveDatabase';
import getDeleteTypes from 'src/modules/getDeleteTypes';
import type { TDatabase } from 'src/modules/interfaces/TDatabase';

export default async function deleteCommandSync(baseOption: TDeleteSchemaOption) {
  try {
    if (baseOption.cliLogo) {
      await showLogo({
        message: 'Schema Nozzle',
        figlet: { font: 'ANSI Shadow', width: 80 },
        color: 'cyan',
      });
    } else {
      spinner.start('Schema Nozzle start');
      spinner.stop('Schema Nozzle start', 'info');
    }

    spinner.start('TypeScript project loading, ...');

    const resolvedPaths = getResolvedPaths(baseOption);
    const project = await getTsProject({ tsConfigFilePath: resolvedPaths.project });

    spinner.stop('TypeScript project load success', 'succeed');

    const diagnostics = getDiagnostics({ option: baseOption, project });
    if (diagnostics.type === 'fail') throw diagnostics.fail;

    spinner.start('Open database, ...');
    const db = await openDatabase(resolvedPaths);
    spinner.stop('database open success', 'succeed');

    const targetTypes = await getDeleteTypes({ db, option: { ...baseOption } });
    if (targetTypes.type === 'fail') throw targetTypes.fail;

    spinner.start(
      `Start [${targetTypes.pass.map((targetType) => `"${targetType}"`).join(', ')}] deletion...`,
    );

    const option: TDeleteSchemaOption = { ...baseOption, types: targetTypes.pass };

    if (targetTypes.pass.length === Object.keys(db).length) {
      await saveDatabase(option, {});

      spinner.stop(
        `[${targetTypes.pass.map((targetType) => `"${targetType}"`).join(', ')}] delete complete`,
        'succeed',
      );

      return;
    }

    const newDb = targetTypes.pass.reduce<TDatabase>((aggregation, identifier) => {
      const schemas = deleteDatabaseItem(aggregation, identifier);
      spinner.stop(`delete schema: ${identifier}`, 'succeed');
      return schemas;
    }, fastCopy(db));

    await saveDatabase(option, newDb);

    spinner.stop(
      `[${targetTypes.pass.map((targetType) => `"${targetType}"`).join(', ')}] delete complete`,
      'succeed',
    );
  } catch (caught) {
    spinner.stop('Error occured...', 'fail');
    const err = isError(caught, new Error('Unknown error raised'));
    throw err;
  }
}
