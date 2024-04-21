export const CE_ALASQL_TABLE_NAME = {
  SCHEMA: 'schemas',
  REF: 'refs',
} as const;

export type CE_ALASQL_TABLE_NAME = (typeof CE_ALASQL_TABLE_NAME)[keyof typeof CE_ALASQL_TABLE_NAME];
