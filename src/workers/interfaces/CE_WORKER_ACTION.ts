export const CE_WORKER_ACTION = {
  PROJECT_LOAD: 'project-load',
  OPTION_LOAD: 'option-load',
  PROJECT_DIAGOSTIC: 'project-diagostic',
  SUMMARY_SCHEMA_FILES: 'summary-schema-files',
  SUMMARY_SCHEMA_TYPES: 'summary-schema-types',
  GENERATOR_OPTION_LOAD: 'generator-option-load',
  CREATE_JSON_SCHEMA: 'create-json-schema',
  TERMINATE: 'terminate',
  NOOP: 'noop',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_WORKER_ACTION = (typeof CE_WORKER_ACTION)[keyof typeof CE_WORKER_ACTION];
