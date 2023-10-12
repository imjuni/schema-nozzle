import spinner from '#/cli/display/spinner';
import type TTruncateSchemaOption from '#/configs/interfaces/TTruncateSchemaOption';
import saveDatabase from '#/databases/saveDatabase';
import { showLogo } from '@maeum/cli-logo';
import { isError } from 'my-easy-fp';

export default async function truncateCommandSync(option: TTruncateSchemaOption) {
  try {
    if (option.cliLogo) {
      await showLogo({
        message: 'Schema Nozzle',
        figlet: { font: 'ANSI Shadow', width: 80 },
        color: 'cyan',
      });
    } else {
      spinner.start('Schema Nozzle start');
      spinner.stop('Schema Nozzle start', 'info');
    }

    spinner.start('Database truncate start, ...');

    await saveDatabase(option, {});

    spinner.stop('truncate complete', 'succeed');
  } catch (caught) {
    spinner.stop('Error occured...', 'fail');
    const err = isError(caught) ?? new Error('Unknown error raised');
    throw err;
  }
}
