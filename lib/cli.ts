import addBuilder from '@cli/addBuilder';
import builder from '@cli/builder';
import deleteBuilder from '@cli/deleteBuilder';
import addOnDatabase from '@commands/addOnDatabase';
import deleteOnDatabase from '@commands/deleteOnDatabase';
import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import isValidateConfig from '@configs/isValidateConfig';
import logger from '@tools/logger';
import yargs, { CommandModule } from 'yargs';

const log = logger();
log.level = 'debug';

const addCmd: CommandModule<IAddSchemaOption, IAddSchemaOption> = {
  command: 'add',
  describe: 'add or update schema on json db file',
  builder: (argv) => addBuilder(builder(argv)),
  handler: async (argv) => {
    await addOnDatabase(argv, true);
    log.trace('complete');
  },
};

const deleteCmd: CommandModule<IDeleteSchemaOption, IDeleteSchemaOption> = {
  command: 'delete',
  describe: 'schema generate on console output or output file',
  builder: (argv) => deleteBuilder(builder(argv)),
  handler: async (argv) => {
    const schemas = await deleteOnDatabase(argv);
    log.trace(schemas);
  },
};

const refreshCmd: CommandModule<IDeleteSchemaOption, IDeleteSchemaOption> = {
  command: 'refresh',
  describe: 'schema generate on console output or output file',
  builder: (argv) => deleteBuilder(builder(argv)),
  handler: async (argv) => {
    const schemas = await deleteOnDatabase(argv);
    log.trace(schemas);
  },
};

const truncateCmd: CommandModule<IDeleteSchemaOption, IDeleteSchemaOption> = {
  command: 'truncate',
  describe: 'schema generate on console output or output file',
  builder: (argv) => deleteBuilder(builder(argv)),
  handler: async (argv) => {
    const schemas = await deleteOnDatabase(argv);
    log.trace(schemas);
  },
};

const parser = yargs(process.argv.slice(2));

parser
  .command(addCmd as CommandModule<{}, IAddSchemaOption>)
  .command(deleteCmd as CommandModule<{}, IDeleteSchemaOption>)
  .command(refreshCmd as CommandModule<{}, IDeleteSchemaOption>)
  .command(truncateCmd as CommandModule<{}, IDeleteSchemaOption>)
  .check(isValidateConfig)
  .recommendCommands()
  .demandCommand()
  .strict(true)
  .help();

(async () => {
  parser.parse();
})();
