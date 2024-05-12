import type { Argv } from 'yargs';

export function builder(argv: Argv) {
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
    })
    .option('verbose', {
      describe: 'verbose',
      type: 'boolean',
      default: false,
    });

  // have no alias option
  argv
    .option('cli-logo', {
      describe: 'display cli logo',
      type: 'boolean',
      default: false,
    })
    .option('types', {
      describe: 'TypeScript type of source code. You can use interface, type alias, enum, class',
      type: 'string',
      default: [],
      array: true,
    })
    .option('skip-error', {
      describe: 'skip compile error on project source file',
      type: 'boolean',
      default: true,
    })
    .option('list-file', {
      describe: 'schema file listing filename',
      type: 'string',
      default: undefined,
    });

  return argv;
}
