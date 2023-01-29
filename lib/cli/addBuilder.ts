import type IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import { TOUTPUT_FORMAT } from '@configs/interfaces/TOUTPUT_FORMAT';
import type { Argv } from 'yargs';

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
    })
    .option('format', {
      describe: 'json-schema save format',
      type: 'string',
      choices: [TOUTPUT_FORMAT.JSON, TOUTPUT_FORMAT.STRING, TOUTPUT_FORMAT.BASE64],
      default: TOUTPUT_FORMAT.JSON,
    });

  return argv as Argv<IAddSchemaOption>;
}
