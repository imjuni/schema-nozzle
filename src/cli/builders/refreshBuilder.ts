import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { Argv } from 'yargs';

export function refreshBuilder(argv: Argv) {
  argv
    .option('root-dir', {
      describe: 'specify the root folder within your schema path',
      type: 'string',
      default: undefined,
    })
    .option('include-path', {
      describe: 'Specify whether to include the DTO path in the schema ID',
      type: 'boolean',
      default: false,
    })
    .option('max-workers', {
      describe: 'max worker count',
      type: 'number',
      default: undefined,
    })
    .option('generator-option', {
      describe: 'ts-json-schema-generator option file path',
      type: 'string',
      default: undefined,
    })
    .option('truncate', {
      describe: 'truncate previous database file',
      type: 'boolean',
      default: false,
    });

  return argv as Argv<TRefreshSchemaOption>;
}
