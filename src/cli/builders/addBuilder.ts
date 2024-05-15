import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { Argv } from 'yargs';

export function addBuilder(argv: Argv) {
  // have no alias option
  argv
    .option('types', {
      describe: 'TypeScript type of source code. You can use interface, type alias, enum, class',
      type: 'string',
      array: true,
      default: [],
    })
    .option('files', {
      describe: 'TypeScript source code file path',
      type: 'string',
      array: true,
      default: [],
    })
    .option('multiple', {
      describe: 'use checkbox with multiple selections',
      type: 'boolean',
      default: false,
    });

  return argv as Argv<TAddSchemaOption>;
}
