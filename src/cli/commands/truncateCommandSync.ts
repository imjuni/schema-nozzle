import type { Spinner } from '#/cli/display/Spinners';
import { makeSpinner } from '#/cli/display/makeSpinner';
import type { TTruncateSchemaOption } from '#/configs/interfaces/TTruncateSchemaOption';
import { truncating } from '#/modules/cli/commands/truncating';
import { container } from '#/modules/containers/container';
import { SPINNER_SYMBOL_KEY } from '#/modules/containers/keys';
import { showLogo } from '@maeum/cli-logo';

import { isError } from 'my-easy-fp';

export async function truncateCommandSync(option: TTruncateSchemaOption) {
  makeSpinner();

  const spinner = container.resolve<Spinner>(SPINNER_SYMBOL_KEY);

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

    spinner.start('database truncate start, ...');

    await truncating(option);

    spinner.stop('database truncate complete', 'succeed');
  } catch (caught) {
    spinner.stop('Error occured...', 'fail');
    const err = isError(caught) ?? new Error('Unknown error raised');
    throw err;
  }
}
