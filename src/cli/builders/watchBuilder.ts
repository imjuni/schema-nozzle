import type { TWatchSchemaOption } from '#/configs/interfaces/TWatchSchemaOption';
import type { Argv } from 'yargs';

export function watchBuilder(argv: Argv) {
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
    .option('generator-option', {
      describe: 'ts-json-schema-generator option file path',
      type: 'string',
      default: undefined,
    });

  return argv as Argv<TWatchSchemaOption>;
}
