import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import type { Argv } from 'yargs';

export function deleteBuilder(argv: Argv) {
  argv
    .option('multiple', {
      describe: 'use checkbox with multiple selections',
      type: 'boolean',
      default: false,
    })
    .option('include-path', {
      describe: 'list of files to generate json-schema from',
      type: 'string',
      array: true,
    })
    .option('exclude-path', {
      describe: 'list of files to exclude from the list of files to generate json-schema from',
      type: 'string',
      array: true,
    })
    .option('top-ref', {
      describe: 'TBD',
      type: 'boolean',
    });

  return argv as Argv<TDeleteSchemaOption>;
}
