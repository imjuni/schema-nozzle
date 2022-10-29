import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import { Argv } from 'yargs';

export default function addBuilder(argv: Argv<{}>) {
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
    .option('generator-option', {
      describe: 'ts-json-schema-generator option file path',
      type: 'string',
    });

  return argv as Argv<IAddSchemaOption>;
}
