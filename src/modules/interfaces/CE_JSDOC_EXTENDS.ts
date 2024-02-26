export const CE_JSDOC_EXTENDS = {
  IGNORE_TAG: 'nozzleIgnore',
  IGNORE_TAG_ALIAS: 'nozzle-ignore',
  REMARK_TAG: 'nozzleTag',
  REMARK_TAG_ALIAS: 'nozzle-tag',
} as const;

export type CE_JSDOC_EXTENDS = (typeof CE_JSDOC_EXTENDS)[keyof typeof CE_JSDOC_EXTENDS];
