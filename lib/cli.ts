import addBuilder from '#cli/builders/addBuilder';
import builder from '#cli/builders/builder';
import deleteBuilder from '#cli/builders/deleteBuilder';
import refreshBuilder from '#cli/builders/refreshBuilder';
import truncateBuilder from '#cli/builders/truncateBuilder';
import addOnDatabaseCluster from '#cli/commands/addOnDatabaseCluster';
import addOnDatabaseSync from '#cli/commands/addOnDatabaseSync';
import deleteOnDatabase from '#cli/commands/deleteOnDatabase';
import refreshOnDatabaseCluster from '#cli/commands/refreshOnDatabaseCluster';
import refreshOnDatabaseSync from '#cli/commands/refreshOnDatabaseSync';
import truncateOnDatabase from '#cli/commands/truncateOnDatabase';
import spinner from '#cli/display/spinner';
import { CE_COMMAND_LIST } from '#cli/interfaces/CE_COMMAND_LIST';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TDeleteSchemaOption from '#configs/interfaces/TDeleteSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import type TTruncateSchemaOption from '#configs/interfaces/TTruncateSchemaOption';
import isValidateConfig from '#configs/isValidateConfig';
import preLoadConfig from '#configs/preLoadConfig';
import withDefaultOption from '#configs/withDefaultOption';
import logger from '#tools/logger';
import worker2 from '#workers/worker';
import cluster from 'cluster';
import { isError } from 'my-easy-fp';
import yargs, { type CommandModule } from 'yargs';

const log = logger();

const addCmd: CommandModule<TAddSchemaOption, TAddSchemaOption> = {
  command: CE_COMMAND_LIST.ADD,
  aliases: CE_COMMAND_LIST.ADD_ALIAS,
  describe: 'add or update json-schema to database file',
  builder: (argv) => addBuilder(builder(argv)),
  handler: async (argv) => {
    spinner.isEnable = true;

    if (process.env.SYNC_MODE === 'true') {
      await addOnDatabaseSync(argv);
    } else {
      await addOnDatabaseCluster(argv);
    }
  },
};

const deleteCmd: CommandModule<TDeleteSchemaOption, TDeleteSchemaOption> = {
  command: CE_COMMAND_LIST.DEL,
  aliases: CE_COMMAND_LIST.DEL_ALIAS,
  describe: 'delete json-schema from database file',
  builder: (argv) => deleteBuilder(builder(argv)),
  handler: async (argv) => {
    spinner.isEnable = true;

    const option = await withDefaultOption(argv);
    await deleteOnDatabase(option);
  },
};

const refreshCmd: CommandModule<TRefreshSchemaOption, TRefreshSchemaOption> = {
  command: CE_COMMAND_LIST.REFRESH,
  aliases: CE_COMMAND_LIST.REFRESH_ALIAS,
  describe: 'regenerate all json-schema in database file',
  builder: (argv) => refreshBuilder(builder(argv)),
  handler: async (argv) => {
    spinner.isEnable = true;

    const option = await withDefaultOption(argv);

    if (process.env.SYNC_MODE === 'true') {
      await refreshOnDatabaseSync(option);
    } else {
      await refreshOnDatabaseCluster(option);
    }
  },
};

const truncateCmd: CommandModule<TTruncateSchemaOption, TTruncateSchemaOption> = {
  command: CE_COMMAND_LIST.TRUNCATE,
  aliases: CE_COMMAND_LIST.TRUNCATE_ALIAS,
  describe: 'reset database file',
  builder: (argv) => truncateBuilder(builder(argv)),
  handler: async (argv) => {
    spinner.isEnable = true;

    const option = await withDefaultOption(argv);
    await truncateOnDatabase(option);
  },
};

if (process.env.SYNC_MODE === 'true') {
  const parser = yargs(process.argv.slice(2));

  parser
    .command(addCmd as CommandModule<{}, TAddSchemaOption>)
    .command(deleteCmd as CommandModule<{}, TDeleteSchemaOption>)
    .command(refreshCmd as CommandModule<{}, TRefreshSchemaOption>)
    .command(truncateCmd as CommandModule<{}, TTruncateSchemaOption>)
    .check(isValidateConfig)
    .recommendCommands()
    .demandCommand(1, 1)
    .config(preLoadConfig())
    .help();

  const handler = async () => {
    await parser.argv;
  };

  handler().catch((catched) => {
    const err = isError(catched, new Error('unknown error raised'));
    log.error(err.message);
    log.error(err.stack);

    process.exit(1);
  });
} else {
  if (cluster.isMaster ?? cluster.isPrimary) {
    const parser = yargs(process.argv.slice(2));

    parser
      .command(addCmd as CommandModule<{}, TAddSchemaOption>)
      .command(deleteCmd as CommandModule<{}, TDeleteSchemaOption>)
      .command(refreshCmd as CommandModule<{}, TRefreshSchemaOption>)
      .command(truncateCmd as CommandModule<{}, TTruncateSchemaOption>)
      .check(isValidateConfig)
      .recommendCommands()
      .demandCommand(1, 1)
      .config(preLoadConfig())
      .help();

    const handler = async () => {
      await parser.argv;
    };

    handler().catch((catched) => {
      const err = isError(catched, new Error('unknown error raised'));
      log.error(err.message);
      log.error(err.stack);

      process.exit(1);
    });
  }

  if (cluster.isWorker) {
    worker2().catch((catched) => {
      const err = isError(catched, new Error('unknown error raised'));
      log.error(err.message);
      log.error(err.stack);
      process.exit(1);
    });
  }
}
