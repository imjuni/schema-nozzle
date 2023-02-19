export const CE_DEFAULT_VALUE = {
  LIST_FILE_NAME: '.nozzlefiles',
  CONFIG_FILE_NAME: '.nozzlerc',
  TSCONFIG_FILE_NAME: 'tsconfig.json',
  DB_FILE_NAME: 'db.json',
  WATCH_DEFAULT_GLOB: '**/*.ts',
  DEFAULT_TASK_WAIT_SECOND: 30,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_DEFAULT_VALUE = (typeof CE_DEFAULT_VALUE)[keyof typeof CE_DEFAULT_VALUE];
