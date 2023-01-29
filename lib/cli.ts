import addBuilder from '@cli/addBuilder';
import builder from '@cli/builder';
import deleteBuilder from '@cli/deleteBuilder';
import { TCOMMAND_LIST } from '@cli/interfaces/TCOMMAND_LIST';
import refreshBuilder from '@cli/refreshBuilder';
import truncateBuilder from '@cli/truncateBuilder';
import addOnDatabaseCluster from '@commands/addOnDatabaseCluster';
import addOnDatabaseSync from '@commands/addOnDatabaseSync';
import deleteOnDatabase from '@commands/deleteOnDatabase';
import refreshOnDatabaseCluster from '@commands/refreshOnDatabaseCluster';
import refreshOnDatabaseSync from '@commands/refreshOnDatabaseSync';
import truncateOnDatabase from '@commands/truncateOnDatabase';
import type IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import type IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import type IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import type ITruncateSchemaOption from '@configs/interfaces/ITruncateSchemaOption';
import isValidateConfig from '@configs/isValidateConfig';
import preLoadConfig from '@configs/preLoadConfig';
import withDefaultOption from '@configs/withDefaultOption';
import worker from '@workers/worker';
import WorkerContainer from '@workers/WorkerContainer';
import cluster from 'cluster';
import { populate } from 'my-easy-fp';
import os from 'os';
import yargs, { type CommandModule } from 'yargs';

const addCmd: CommandModule<IAddSchemaOption, IAddSchemaOption> = {
  command: TCOMMAND_LIST.ADD,
  aliases: TCOMMAND_LIST.ADD_ALIAS,
  describe: 'add or update json-schema to database file',
  builder: (argv) => addBuilder(builder(argv)),
  handler: async (argv) => {
    const option = await withDefaultOption(argv);

    if (process.env.SYNC_MODE === 'true') {
      await addOnDatabaseSync(option, true);
    } else {
      populate(os.cpus().length).forEach(() => {
        WorkerContainer.add(cluster.fork());
      });

      await addOnDatabaseCluster(option, true);
    }
  },
};

const deleteCmd: CommandModule<IDeleteSchemaOption, IDeleteSchemaOption> = {
  command: TCOMMAND_LIST.DEL,
  aliases: TCOMMAND_LIST.DEL_ALIAS,
  describe: 'delete json-schema from database file',
  builder: (argv) => deleteBuilder(builder(argv)),
  handler: async (argv) => {
    const option = await withDefaultOption(argv);
    await deleteOnDatabase(option, true);
  },
};

const refreshCmd: CommandModule<IRefreshSchemaOption, IRefreshSchemaOption> = {
  command: TCOMMAND_LIST.REFRESH,
  aliases: TCOMMAND_LIST.REFRESH_ALIAS,
  describe: 'regenerate all json-schema in database file',
  builder: (argv) => refreshBuilder(builder(argv)),
  handler: async (argv) => {
    const option = await withDefaultOption(argv);

    if (process.env.SYNC_MODE === 'true') {
      await refreshOnDatabaseSync(option, true);
    } else {
      populate(os.cpus().length).forEach(() => {
        WorkerContainer.add(cluster.fork());
      });

      await refreshOnDatabaseCluster(option, true);
    }
  },
};

const truncateCmd: CommandModule<ITruncateSchemaOption, ITruncateSchemaOption> = {
  command: TCOMMAND_LIST.TRUNCATE,
  aliases: TCOMMAND_LIST.TRUNCATE_ALIAS,
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
    .command(addCmd as CommandModule<{}, IAddSchemaOption>)
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
      .command(addCmd as CommandModule<{}, IAddSchemaOption>)
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
    worker();
  }
}
