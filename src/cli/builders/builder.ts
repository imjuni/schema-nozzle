import { CE_DEFAULT_VALUE } from '#configs/interfaces/CE_DEFAULT_VALUE';
import type { Argv } from 'yargs';

export default function builder(argv: Argv) {
  // have alias option
  argv
    .option('project', {
      alias: 'p',
      describe: 'tsconfig.json path: you must pass path with filename, like this "./tsconfig.json"',
      type: 'string',
    })
    .option('config', {
      alias: 'c',
      describe: 'configuration file path',
      type: 'string',
    })
    .option('output', {
      alias: 'o',
      describe: 'database file path',
      type: 'string',
    });

  // have no alias option
  argv
    .option('types', {
      describe: 'TypeScript type of source code. You can use interface, type alias, enum, class.',
      type: 'string',
      default: [],
      array: true,
    })
    .option('skip-error', {
      describe: 'skip compile error on source file',
      type: 'boolean',
      default: true,
    })
    .option('list-file', {
      describe: 'target list filename',
      type: 'string',
      default: undefined,
    })
    .option('generator-timeout', {
      describe: 'ts-json-schema-generator timeout: default 90 seconds',
      type: 'number',
      default: CE_DEFAULT_VALUE.DEFAULT_TASK_WAIT_SECOND * 3,
    });

  return argv;
}
