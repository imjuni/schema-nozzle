export const CE_JSDOC_EXTENDS = {
  AS_DTO: 'asDto',
  AS_DTO_ALIAS: 'as-dto',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_JSDOC_EXTENDS = (typeof CE_JSDOC_EXTENDS)[keyof typeof CE_JSDOC_EXTENDS];
