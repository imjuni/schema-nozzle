export const CE_WORKER_ACTION = {
  OPTION_LOAD: 'option-load',
  PROJECT_LOAD: 'project-load',
  PROJECT_DIAGONOSTIC: 'project-diagostic',

  SUMMARY_SCHEMA_FILES: 'summary-schema-files',
  SUMMARY_SCHEMA_TYPES: 'summary-schema-types',
  SUMMARY_SCHEMA_FILE_TYPE: 'summary-schema-file-type',
  LOAD_DATABASE: 'load-database',

  CREATE_JSON_SCHEMA: 'create-json-schema',
  CREATE_JSON_SCHEMA_BULK: 'create-json-schema-bulk',

  WATCH_SOURCE_FILE_ADD: 'watch-source-file-add',
  WATCH_SOURCE_FILE_CHANGE: 'watch-source-file-change',
  WATCH_SOURCE_FILE_UNLINK: 'watch-source-file-unlink',

  TERMINATE: 'terminate',
  NOOP: 'noop',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_WORKER_ACTION = (typeof CE_WORKER_ACTION)[keyof typeof CE_WORKER_ACTION];
