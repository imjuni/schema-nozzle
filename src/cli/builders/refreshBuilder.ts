import { CE_OUTPUT_FORMAT } from '#configs/interfaces/CE_OUTPUT_FORMAT';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import type { Argv } from 'yargs';

export default function refreshBuilder(argv: Argv) {
  argv
    .option('generator-option', {
      describe: 'ts-json-schema-generator option file path',
      type: 'string',
      default: undefined,
    })
    .option('format', {
      describe: 'json-schema save format',
      type: 'string',
      choices: [CE_OUTPUT_FORMAT.JSON, CE_OUTPUT_FORMAT.STRING, CE_OUTPUT_FORMAT.BASE64],
      default: CE_OUTPUT_FORMAT.JSON,
    });

  return argv as Argv<TRefreshSchemaOption>;
}
