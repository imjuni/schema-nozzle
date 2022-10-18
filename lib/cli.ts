import builder from '@cli/builder';
import consoleBuilder from '@cli/console-builder';
import dbBuilder from '@cli/db-builder';
import IConsoleOption from '@configs/interfaces/IConsoleOption';
import IDatabaseOption from '@configs/interfaces/IDatabaseOption';
import isValidateConfig from '@configs/isValidateConfig';
import logger from '@tools/logger';
import yargs, { CommandModule } from 'yargs';
import { createOnConsole, createOnDatabase } from './ctjs';

const log = logger();
log.level = 'debug';

const dbCmd: CommandModule<IDatabaseOption, IDatabaseOption> = {
  command: 'db',
  describe: 'schema generate on single json file',
  builder: (argv) => dbBuilder(builder(argv)),
  handler: async (argv) => {
    await createOnDatabase(argv);
    log.trace('complete');
  },
};

const consoleCmd: CommandModule<IConsoleOption, IConsoleOption> = {
  command: 'console',
  describe: 'schema generate on console output or output file',
  builder: (argv) => consoleBuilder(builder(argv)),
  handler: async (argv) => {
    const schemas = await createOnConsole(argv);
    log.trace(schemas);
  },
};

const parser = yargs(process.argv.slice(2));

parser
  .command(dbCmd as CommandModule<{}, IDatabaseOption>)
  .command(consoleCmd as CommandModule<{}, IConsoleOption>)
  .check(isValidateConfig)
  .recommendCommands()
  .demandCommand()
  .strict(true)
  .help();

(async () => {
  parser.parse();
})();
