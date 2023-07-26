import { getLogLabel, getLogLevel } from '#tools/loggerModule';
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

export function loggerClear() {
  log = undefined;
}

export default function logger() {
  if (log === undefined) {
    const stream = pretty({
      translateTime: 'yy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
      colorize: false,
      customPrettifiers: {
        level: (unknownLevel: unknown) => {
          const levelCode = getLogLevel(unknownLevel);
          const levelLabel = getLogLabel(levelCode);

          switch (levelLabel) {
            case 'debug':
              return `${chalk.blueBright(pino.levels.labels[levelCode])}`;
            case 'info':
              return `${chalk.greenBright(pino.levels.labels[levelCode])}`;
            case 'warn':
              return `${chalk.yellowBright(pino.levels.labels[levelCode])}`;
            case 'error':
              return `${chalk.redBright(pino.levels.labels[levelCode])}`;
            default:
              return `${chalk.greenBright(pino.levels.labels[levelCode])}`;
          }
        },
      },
      sync: true,
    });

    log = pino(
      {
        browser: { asObject: true },

        customLevels: {
          trace: pino.levels.values.trace ?? 7,
          verbose: pino.levels.values.verbose ?? 6,
          debug: pino.levels.values.debug ?? 5,
          info: pino.levels.values.info ?? 4,
          warn: pino.levels.values.warn ?? 3,
          error: pino.levels.values.error ?? 2,
          fatal: pino.levels.values.fatal ?? 1,
        },
      },
      stream,
    );

    log.level = process.env.LOG_LEVEL ?? 'info';
  }

  return log;
}
