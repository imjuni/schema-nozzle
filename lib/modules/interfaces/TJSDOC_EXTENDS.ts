export const TJSDOC_EXTENDS = {
  AS_DTO: 'asDto',
  AS_DTO_ALIAS: 'as-dto',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type TJSDOC_EXTENDS = (typeof TJSDOC_EXTENDS)[keyof typeof TJSDOC_EXTENDS];
