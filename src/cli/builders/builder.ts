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
      describe: 'verbose message. verbose option disable spinner and progress bar',
      alias: 'v',
      type: 'boolean',
      default: false,
    });

  return argv;
}
