import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import { CE_OUTPUT_FORMAT } from '#/configs/const-enum/CE_OUTPUT_FORMAT';
import type { TWatchSchemaOption } from '#/configs/interfaces/TWatchSchemaOption';
import type { Argv } from 'yargs';

export function watchBuilder(argv: Argv) {
  argv
    .option('format', {
      describe: 'json-schema save format',
      type: 'string',
      choices: [CE_OUTPUT_FORMAT.JSON, CE_OUTPUT_FORMAT.STRING, CE_OUTPUT_FORMAT.BASE64],
      default: CE_OUTPUT_FORMAT.JSON,
    })
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
    .option('debounce-time', {
      describe: 'watch debounce time: default 1000ms',
      type: 'number',
      default: CE_DEFAULT_VALUE.WATCH_DEBOUNCE_TIME,
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
    });

  return argv as Argv<TWatchSchemaOption>;
}
