export const CE_DEFAULT_VALUE = {
  LIST_FILE: '.nozzlefiles',
  CONFIG_FILE_NAME: '.nozzlerc',
  TSCONFIG_FILE_NAME: 'tsconfig.json',
  DB_FILE_NAME: 'db.json',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_DEFAULT_VALUE = (typeof CE_DEFAULT_VALUE)[keyof typeof CE_DEFAULT_VALUE];
