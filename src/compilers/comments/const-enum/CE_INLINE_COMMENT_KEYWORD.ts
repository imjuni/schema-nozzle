export const CE_INLINE_COMMENT_KEYWORD = {
  FILE_EXCLUDE_KEYWORD: '@schema-nozzle-exclude',
  SCHEMA_NOZZLE_WORKSPACE: 'schema-nozzle',
} as const;

export type CE_INLINE_COMMENT_KEYWORD =
  (typeof CE_INLINE_COMMENT_KEYWORD)[keyof typeof CE_INLINE_COMMENT_KEYWORD];
