export const CE_JSDOC_EXTENDS = {
  IGNORE_FILE_TAG_ALIAS: '@schemaNozzleExclude',
  IGNORE_FILE_TAG: '@schema-nozzle-exclude',
  IGNORE_TAG_ALIAS: '@schemaNozzleExcludeNext',
  IGNORE_TAG: '@schema-nozzle-exclude-next',
  REMARK_TAG_ALIAS: '@nozzleTag',
  REMARK_TAG: '@nozzle-tag',
} as const;

export type CE_JSDOC_EXTENDS = (typeof CE_JSDOC_EXTENDS)[keyof typeof CE_JSDOC_EXTENDS];
