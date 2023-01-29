import type IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import { TOUTPUT_FORMAT } from '@configs/interfaces/TOUTPUT_FORMAT';
import type { Argv } from 'yargs';

export default function refreshBuilder(argv: Argv<{}>) {
  argv
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

  return argv as Argv<IRefreshSchemaOption>;
}
