import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { Argv } from 'yargs';

export function refreshBuilder(argv: Argv) {
  argv
    .option('root-dir', {
      describe: 'specify the root folder within your schema path',
      type: 'string',
      default: undefined,
    })
    .option('use-schema-path', {
      describe: 'toggles whether to add the schema file path to the ID value',
      type: 'boolean',
      default: false,
    })
    .option('top-ref', {
      describe:
        'Specify whether the schema should be managed as `definitions`. Same as the `top-ref` setting for `ts-json-schema-generator`',
      type: 'boolean',
      default: false,
    })
    .option('server-url', {
      describe:
        'Specify whether the schema should be managed as `definitions`. Same as the `top-ref` setting for `ts-json-schema-generator`',
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
