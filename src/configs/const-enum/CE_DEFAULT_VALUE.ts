export const CE_DEFAULT_VALUE = {
  CONFIG_FILE_NAME: '.nozzlerc',
  TSCONFIG_FILE_NAME: 'tsconfig.json',

  DB_FILE_NAME: 'db.json',
  DB_COLLECTION_NAME: 'json-schema',
} as const;

export type CE_DEFAULT_VALUE = (typeof CE_DEFAULT_VALUE)[keyof typeof CE_DEFAULT_VALUE];
