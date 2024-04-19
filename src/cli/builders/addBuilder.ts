import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { Argv } from 'yargs';

export function addBuilder(argv: Argv) {
  // have no alias option
  argv
    .option('files', {
      describe: 'TypeScript source code file path',
      type: 'string',
      default: [],
      array: true,
    })
    .option('multiple', {
      describe: 'use checkbox with multiple selections',
      type: 'boolean',
      default: false,
    })
    .option('root-dir', {
      describe: 'specify the root folder within your schema path',
      type: 'string',
      default: undefined,
    })
    .option('use-definitions', {
      describe: 'TBD',
      type: 'boolean',
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
    });

  return argv as Argv<TAddSchemaOption>;
}
