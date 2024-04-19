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
      describe: 'list of files to generate json-schema from',
      type: 'string',
      array: true,
    })
    .option('exclude-path', {
      describe: 'list of files to exclude from the list of files to generate json-schema from',
      type: 'string',
      array: true,
    })
    .option('use-definitions', {
      describe: 'TBD',
      type: 'boolean',
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
