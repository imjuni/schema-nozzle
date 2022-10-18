import { Argv } from 'yargs';

export default function builder(argv: Argv<{}>) {
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
    .option('verbose', {
      alias: 'v',
      describe: 'verbose message',
      type: 'string',
    });

  // have no alias option
  argv
    .option('no-banner', {
      describe: 'configuration file path',
      type: 'string',
      default: true,
    })
    .option('files', {
      describe: 'configuration file path',
      type: 'string',
      default: [],
      array: true,
    })
    .option('types', {
      describe: 'configuration file path',
      type: 'string',
      default: [],
      array: true,
    })
    .option('skip-error', {
      describe: 'skip compile error on source file',
      type: 'boolean',
      default: true,
    });

  return argv;
}
