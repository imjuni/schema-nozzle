import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import type { Argv } from 'yargs';

export function deleteBuilder(argv: Argv) {
  argv
    .option('types', {
      describe: 'TypeScript type of source code. You can use interface, type alias, enum, class',
      type: 'string',
      array: true,
      default: [],
    })
    .option('multiple', {
      describe: 'use checkbox with multiple selections',
      type: 'boolean',
      default: false,
    });

  return argv as Argv<TDeleteSchemaOption>;
}
