export const CE_FUZZY_SCORE_LIMIT = {
  FILE_CHOICE_FUZZY: 30,
  TYPE_CHOICE_FUZZY: 30,
  DELETE_TYPE_CHOICE_FUZZY: 30,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_FUZZY_SCORE_LIMIT = (typeof CE_FUZZY_SCORE_LIMIT)[keyof typeof CE_FUZZY_SCORE_LIMIT];
