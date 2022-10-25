import addBuilder from '@cli/addBuilder';
import builder from '@cli/builder';
import deleteBuilder from '@cli/deleteBuilder';
import truncateBuilder from '@cli/truncateBuilder';
import addOnDatabase from '@commands/addOnDatabase';
import deleteOnDatabase from '@commands/deleteOnDatabase';
import truncateOnDatabase from '@commands/truncateOnDatabase';
import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import ITruncateSchemaOption from '@configs/interfaces/ITruncateSchemaOption';
import isValidateConfig from '@configs/isValidateConfig';
import preLoadConfig from '@configs/preLoadConfig';
import withDefaultOption from '@configs/withDefaultOption';
import logger from '@tools/logger';
import yargs, { CommandModule } from 'yargs';

const log = logger();
log.level = 'debug';

const addCmd: CommandModule<IAddSchemaOption, IAddSchemaOption> = {
  command: 'add',
  describe: 'add or update schema on json db file',
  builder: (argv) => addBuilder(builder(argv)),
  handler: async (argv) => {
    const option = await withDefaultOption(argv);
    await addOnDatabase(option, true);
  },
};

const deleteCmd: CommandModule<IDeleteSchemaOption, IDeleteSchemaOption> = {
  command: 'del',
  describe: 'schema generate on console output or output file',
  builder: (argv) => deleteBuilder(builder(argv)),
  handler: async (argv) => {
    const option = await withDefaultOption(argv);
    const schemas = await deleteOnDatabase(option);
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

const truncateCmd: CommandModule<ITruncateSchemaOption, ITruncateSchemaOption> = {
  command: 'truncate',
  describe: 'schema generate on console output or output file',
  builder: (argv) => truncateBuilder(builder(argv)),
  handler: async (argv) => {
    const option = await withDefaultOption(argv);
    const schemas = await truncateOnDatabase(option);
    log.trace(schemas);
  },
};

const parser = yargs(process.argv.slice(2));

parser
  .command(addCmd as CommandModule<{}, IAddSchemaOption>)
  .command(deleteCmd as CommandModule<{}, IDeleteSchemaOption>)
  .command(refreshCmd as CommandModule<{}, IDeleteSchemaOption>)
  .command(truncateCmd as CommandModule<{}, ITruncateSchemaOption>)
  .check(isValidateConfig)
  .recommendCommands()
  .demandCommand()
  .config(preLoadConfig())
  .strict(true)
  .help();

(async () => {
  parser.parse();
})();
