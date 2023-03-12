import chalk from 'chalk';
import pino, { type Logger } from 'pino';
import pretty from 'pino-pretty';

let log:
  | Logger<{
      browser: {
        asObject: true;
      };
      customLevels: {
        debug: number;
        verbose: number;
        info: number;
        warn: number;
        error: number;
      };
    }>
  | undefined;

export default function logger(): Logger<{
  browser: {
    asObject: true;
  };
  customLevels: {
    debug: number;
    verbose: number;
    info: number;
    warn: number;
    error: number;
  };
}> {
  if (log == null) {
    const stream = pretty({
      translateTime: 'yy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
      colorize: false,
      sync: true,
      customPrettifiers: {
        level: (loglevel: string | object) => {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          const ll = Number.parseInt(loglevel.toString(), 10);
          const levelLabel = pino.levels.labels[ll].toLowerCase();

          switch (levelLabel) {
            case 'debug':
              return `${chalk.blueBright(pino.levels.labels[ll])}`;
            case 'info':
              return `${chalk.greenBright(pino.levels.labels[ll])}`;
            case 'warn':
              return `${chalk.yellowBright(pino.levels.labels[ll])}`;
            case 'error':
              return `${chalk.redBright(pino.levels.labels[ll])}`;
            default:
              return `${chalk.greenBright(pino.levels.labels[ll])}`;
          }
        },
      },
    });

    log = pino(
      {
        browser: { asObject: true },

        customLevels: {
          debug: pino.levels.values.trace,
          verbose: pino.levels.values.debug,
          info: pino.levels.values.info,
          warn: pino.levels.values.warn,
          error: pino.levels.values.error,
        },
      },
      stream,
    );

    log.level = process.env.LOG_LEVEL ?? 'info';
  }

  return log;
}
