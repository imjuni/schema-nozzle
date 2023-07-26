import addBuilder from '#cli/builders/addBuilder';
import builder from '#cli/builders/builder';
import deleteBuilder from '#cli/builders/deleteBuilder';
import refreshBuilder from '#cli/builders/refreshBuilder';
import truncateBuilder from '#cli/builders/truncateBuilder';
import watchBuilder from '#cli/builders/watchBuilder';
import addCommandCluster from '#cli/commands/addCommandCluster';
import addCommandSync from '#cli/commands/addCommandSync';
import deleteCommandSync from '#cli/commands/deleteCommandSync';
import initCommandSync from '#cli/commands/initCommandSync';
import refreshCommandCluster from '#cli/commands/refreshCommandCluster';
import refreshCommandSync from '#cli/commands/refreshCommandSync';
import truncateCommandSync from '#cli/commands/truncateCommandSync';
import watchCommandSync from '#cli/commands/watchCommandSync';
import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import { CE_COMMAND_LIST } from '#cli/interfaces/CE_COMMAND_LIST';
import type IInitOption from '#configs/interfaces/IInitOption';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TDeleteSchemaOption from '#configs/interfaces/TDeleteSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import type TTruncateSchemaOption from '#configs/interfaces/TTruncateSchemaOption';
import type TWatchSchemaOption from '#configs/interfaces/TWatchSchemaOption';
import isValidateConfig from '#configs/isValidateConfig';
import preLoadConfig from '#configs/preLoadConfig';
import withDefaultOption from '#configs/withDefaultOption';
import logger from '#tools/logger';
import worker from '#workers/worker';
import cluster from 'cluster';
import { isError } from 'my-easy-fp';
import yargs, { type Arguments, type CommandModule } from 'yargs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TValidator = (argv: Arguments<any>, aliases: { [alias: string]: string }) => any;

const log = logger();

const addCmd: CommandModule<TAddSchemaOption, TAddSchemaOption> = {
  command: CE_COMMAND_LIST.ADD,
  aliases: CE_COMMAND_LIST.ADD_ALIAS,
  describe: 'add or update json-schema to database file',
  builder: (argv) => addBuilder(builder(argv)),
  handler: async (argv) => {
    spinner.isEnable = true;
    progress.isEnable = true;

    if (process.env.SYNC_MODE === 'true') {
      await addCommandSync(argv);
    } else {
      await addCommandCluster(argv);
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
    progress.isEnable = true;

    const option = await withDefaultOption(argv);
    await deleteCommandSync(option);
  },
};

const refreshCmd: CommandModule<TRefreshSchemaOption, TRefreshSchemaOption> = {
  command: CE_COMMAND_LIST.REFRESH,
  aliases: CE_COMMAND_LIST.REFRESH_ALIAS,
  describe: 'regenerate all json-schema in database file',
  builder: (argv) => refreshBuilder(builder(argv)),
  handler: async (argv) => {
    spinner.isEnable = true;
    progress.isEnable = true;

    const option = await withDefaultOption(argv);

    if (process.env.SYNC_MODE === 'true') {
      await refreshCommandSync(option);
    } else {
      await refreshCommandCluster(option);
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
    progress.isEnable = true;

    const option = await withDefaultOption(argv);
    await truncateCommandSync(option);
  },
};

const initCmd: CommandModule<IInitOption, IInitOption> = {
  command: CE_COMMAND_LIST.INIT,
  aliases: CE_COMMAND_LIST.INIT_ALIAS,
  describe: 'init schema-nozzle',
  builder: (argv) => argv,
  handler: async (argv) => {
    spinner.isEnable = true;
    progress.isEnable = true;

    await initCommandSync(argv);
  },
};

const watchCmd: CommandModule<TWatchSchemaOption, TWatchSchemaOption> = {
  command: CE_COMMAND_LIST.WATCH,
  aliases: CE_COMMAND_LIST.WATCH_ALIAS,
  describe: 'watch schema-nozzle',
  builder: (argv) => watchBuilder(builder(argv)),
  handler: async (argv) => {
    spinner.isEnable = true;
    progress.isEnable = true;

    const option = await withDefaultOption(argv);

    await watchCommandSync(option);
  },
};

if (process.env.SYNC_MODE === 'true') {
  const parser = yargs(process.argv.slice(2));

  parser
    .command(addCmd as CommandModule<unknown, TAddSchemaOption>)
    .command(deleteCmd as CommandModule<unknown, TDeleteSchemaOption>)
    .command(refreshCmd as CommandModule<unknown, TRefreshSchemaOption>)
    .command(truncateCmd as CommandModule<unknown, TTruncateSchemaOption>)
    .command(initCmd as CommandModule<unknown, IInitOption>)
    .command(watchCmd as CommandModule<unknown, TWatchSchemaOption>)
    .check(isValidateConfig as TValidator)
    .recommendCommands()
    .demandCommand(1, 1)
    .config(preLoadConfig())
    .help();

  const handler = async () => {
    await parser.argv;
  };

  handler().catch((caught) => {
    const err = isError(caught, new Error('unknown error raised'));
    log.error(err.message);
    log.error(err.stack);

    process.exit(1);
  });
} else {
  if (cluster.isPrimary) {
    const parser = yargs(process.argv.slice(2));

    parser
      .command(addCmd as CommandModule<unknown, TAddSchemaOption>)
      .command(deleteCmd as CommandModule<unknown, TDeleteSchemaOption>)
      .command(refreshCmd as CommandModule<unknown, TRefreshSchemaOption>)
      .command(truncateCmd as CommandModule<unknown, TTruncateSchemaOption>)
      .command(initCmd as CommandModule<unknown, IInitOption>)
      .command(watchCmd as CommandModule<unknown, TWatchSchemaOption>)
      .check(isValidateConfig as TValidator)
      .recommendCommands()
      .demandCommand(1, 1)
      .config(preLoadConfig())
      .help();

    const handler = async () => {
      await parser.argv;
    };

    handler().catch((caught) => {
      const err = isError(caught, new Error('unknown error raised'));
      log.error(err.message);
      log.error(err.stack);

      process.exit(1);
    });
  }

  if (cluster.isWorker) {
    worker().catch((caught) => {
      const err = isError(caught, new Error('unknown error raised'));
      log.error(err.message);
      log.error(err.stack);
      process.exit(1);
    });
  }
}
