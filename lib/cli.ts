import addBuilder from '@cli/addBuilder';
import builder from '@cli/builder';
import deleteBuilder from '@cli/deleteBuilder';
import { CE_COMMAND_LIST } from '@cli/interfaces/CE_COMMAND_LIST';
import refreshBuilder from '@cli/refreshBuilder';
import spinner from '@cli/spinner';
import truncateBuilder from '@cli/truncateBuilder';
import addOnDatabaseCluster from '@commands/addOnDatabaseCluster';
import addOnDatabaseSync from '@commands/addOnDatabaseSync';
import deleteOnDatabase from '@commands/deleteOnDatabase';
import refreshOnDatabaseCluster from '@commands/refreshOnDatabaseCluster';
import refreshOnDatabaseSync from '@commands/refreshOnDatabaseSync';
import truncateOnDatabase from '@commands/truncateOnDatabase';
import type IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import type IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import type ITruncateSchemaOption from '@configs/interfaces/ITruncateSchemaOption';
import type TAddSchemaOption from '@configs/interfaces/TAddSchemaOption';
import isValidateConfig from '@configs/isValidateConfig';
import preLoadConfig from '@configs/preLoadConfig';
import withDefaultOption from '@configs/withDefaultOption';
import worker2 from '@workers/worker';
import cluster from 'cluster';
import yargs, { type CommandModule } from 'yargs';

const addCmd: CommandModule<TAddSchemaOption, TAddSchemaOption> = {
  command: CE_COMMAND_LIST.ADD,
  aliases: CE_COMMAND_LIST.ADD_ALIAS,
  describe: 'add or update json-schema to database file',
  builder: (argv) => addBuilder(builder(argv)),
  handler: async (argv) => {
    spinner.isEnable = true;

    if (process.env.SYNC_MODE === 'true') {
      await addOnDatabaseSync(argv, true);
    } else {
      await addOnDatabaseCluster(argv);
    }
  },
};

const deleteCmd: CommandModule<IDeleteSchemaOption, IDeleteSchemaOption> = {
  command: CE_COMMAND_LIST.DEL,
  aliases: CE_COMMAND_LIST.DEL_ALIAS,
  describe: 'delete json-schema from database file',
  builder: (argv) => deleteBuilder(builder(argv)),
  handler: async (argv) => {
    const option = await withDefaultOption(argv);
    await deleteOnDatabase(option, true);
  },
};

const refreshCmd: CommandModule<IRefreshSchemaOption, IRefreshSchemaOption> = {
  command: CE_COMMAND_LIST.REFRESH,
  aliases: CE_COMMAND_LIST.REFRESH_ALIAS,
  describe: 'regenerate all json-schema in database file',
  builder: (argv) => refreshBuilder(builder(argv)),
  handler: async (argv) => {
    const option = await withDefaultOption(argv);

    if (process.env.SYNC_MODE === 'true') {
      await refreshOnDatabaseSync(option, true);
    } else {
      await refreshOnDatabaseCluster(option, true);
    }
  },
};

const truncateCmd: CommandModule<ITruncateSchemaOption, ITruncateSchemaOption> = {
  command: CE_COMMAND_LIST.TRUNCATE,
  aliases: CE_COMMAND_LIST.TRUNCATE_ALIAS,
  describe: 'reset database file',
  builder: (argv) => truncateBuilder(builder(argv)),
  handler: async (argv) => {
    const option = await withDefaultOption(argv);
    await truncateOnDatabase(option, true);
  },
};

if (process.env.SYNC_MODE === 'true') {
  const parser = yargs(process.argv.slice(2));

  parser
    .command(addCmd as CommandModule<{}, TAddSchemaOption>)
    .command(deleteCmd as CommandModule<{}, IDeleteSchemaOption>)
    .command(refreshCmd as CommandModule<{}, IRefreshSchemaOption>)
    .command(truncateCmd as CommandModule<{}, ITruncateSchemaOption>)
    .check(isValidateConfig)
    .recommendCommands()
    .demandCommand(1, 1)
    .config(preLoadConfig())
    .help();

  (async () => {
    try {
      const handle = parser.parse();
      await handle;
    } catch {
      process.exit(1);
    }
  })();
} else {
  if (cluster.isMaster ?? cluster.isPrimary) {
    const parser = yargs(process.argv.slice(2));

    parser
      .command(addCmd as CommandModule<{}, TAddSchemaOption>)
      .command(deleteCmd as CommandModule<{}, IDeleteSchemaOption>)
      .command(refreshCmd as CommandModule<{}, IRefreshSchemaOption>)
      .command(truncateCmd as CommandModule<{}, ITruncateSchemaOption>)
      .check(isValidateConfig)
      .recommendCommands()
      .demandCommand(1, 1)
      .config(preLoadConfig())
      .help();

    (async () => {
      try {
        const handle = parser.parse();
        await handle;
      } catch {
        process.exit(1);
      }
    })();
  }

  if (cluster.isWorker) {
    worker2();
  }
}
