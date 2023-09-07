import { CE_DEFAULT_VALUE } from 'src/configs/interfaces/CE_DEFAULT_VALUE';
import { CE_OUTPUT_FORMAT } from 'src/configs/interfaces/CE_OUTPUT_FORMAT';
import type TRefreshSchemaOption from 'src/configs/interfaces/TRefreshSchemaOption';
import type { Argv } from 'yargs';

export default function refreshBuilder(argv: Argv) {
  argv
    .option('format', {
      describe: 'json-schema save format',
      type: 'string',
      choices: [CE_OUTPUT_FORMAT.JSON, CE_OUTPUT_FORMAT.STRING, CE_OUTPUT_FORMAT.BASE64],
      default: CE_OUTPUT_FORMAT.JSON,
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
    .option('generator-timeout', {
      describe: 'ts-json-schema-generator timeout: default 90 seconds',
      type: 'number',
      default: CE_DEFAULT_VALUE.DEFAULT_TASK_WAIT_SECOND * 3,
    })
    .option('truncate', {
      describe: 'truncate previous database file',
      type: 'boolean',
      default: false,
    });

  return argv as Argv<TRefreshSchemaOption>;
}
