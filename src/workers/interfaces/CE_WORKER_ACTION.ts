export const CE_WORKER_ACTION = {
  OPTION_LOAD: 'option-load',
  PROJECT_LOAD: 'project-load',
  PROJECT_DIAGONOSTIC: 'project-diagostic',
  SUMMARY_SCHEMA_FILES: 'summary-schema-files',
  LOAD_DATABASE: 'load-database',
  SCHEMA_FILE_FILTER_UPDATE: 'schema-file-filter-update',
  SUMMARY_SCHEMA_TYPES: 'summary-schema-types',
  GENERATOR_OPTION_LOAD: 'generator-option-load',
  CREATE_JSON_SCHEMA: 'create-json-schema',
  CREATE_JSON_SCHEMA_BULK: 'create-json-schema-bulk',
  TERMINATE: 'terminate',
  NOOP: 'noop',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_WORKER_ACTION = (typeof CE_WORKER_ACTION)[keyof typeof CE_WORKER_ACTION];
