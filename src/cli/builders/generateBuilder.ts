import type { Argv } from 'yargs';

export function generateBuilder(argv: Argv) {
  // have no alias option
  argv
    .option('include', {
      describe: 'list of files to generate json-schema from',
      type: 'string',
      array: true,
      default: [],
    })
    .option('exclude', {
      describe: 'list of files to exclude from the list of files to generate json-schema from',
      type: 'string',
      array: true,
      default: [],
    })
    .option('root-dirs', {
      describe: 'specify the root folder within your schema path',
      array: true,
      type: 'string',
      default: [],
    })
    .option('js-var', {
      describe: 'schema id to convert the path and schema name to js variables',
      type: 'boolean',
      default: false,
    })
    .option('skip-error', {
      describe: 'skip compile error on project source file',
      type: 'boolean',
      default: true,
    })
    .option('use-schema-path', {
      describe: 'toggles whether to add the schema file path to the ID value',
      type: 'boolean',
      default: false,
    })
    .option('escape-char', {
      describe:
        'Characters that cannot be used as variable names when converting JS variables Characters to use when converting',
      type: 'string',
      default: '_',
    })
    .option('server-url', {
      describe:
        'enter the server url that will be used as the `$id` in the schema store when the topRef setting is set to true',
      type: 'string',
      default: undefined,
    })
    .option('generator-option', {
      describe: 'ts-json-schema-generator option file path',
      type: 'string',
      default: undefined,
    });

  return argv;
}
