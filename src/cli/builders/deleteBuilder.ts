import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import type { Argv } from 'yargs';

export function deleteBuilder(argv: Argv) {
  argv.option('multiple', {
    describe: 'use checkbox with multiple selections',
    type: 'boolean',
    default: false,
  });

  return argv as Argv<TDeleteSchemaOption>;
}
