import spinner from '#cli/display/spinner';
import type TTruncateSchemaOption from '#configs/interfaces/TTruncateSchemaOption';
import saveDatabase from '#databases/saveDatabase';
import { showLogo } from '@maeum/cli-logo';
import { isError } from 'my-easy-fp';

export default async function truncateOnDatabase(option: TTruncateSchemaOption) {
  try {
    if (option.cliLogo) {
      await showLogo({
        message: 'Schema Nozzle',
        figlet: { font: 'ANSI Shadow', width: 80 },
        color: 'cyan',
      });
    } else {
      spinner.start('Schema Nozzle start');
      spinner.update({ message: 'Schema Nozzle start', channel: 'info' });
      spinner.stop();
    }

    spinner.start('Database truncate start, ...');

    await saveDatabase(option, {});

    spinner.stop({
      message: 'truncate complete',
      channel: 'succeed',
    });
  } catch (caught) {
    spinner.stop({ message: 'Error occured...', channel: 'fail' });
    const err = isError(caught) ?? new Error('Unknown error raised');
    throw err;
  }
}
