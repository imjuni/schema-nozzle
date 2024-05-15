import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { Argv } from 'yargs';

export function refreshBuilder(argv: Argv) {
  argv.option('truncate', {
    describe: 'truncate previous database file',
    type: 'boolean',
    default: false,
  });

  return argv as Argv<TRefreshSchemaOption>;
}
