export const TFUZZY_SCORE_LIMIT = {
  FILE_CHOICE_FUZZY: 50,
  TYPE_CHOICE_FUZZY: 50,
  DELETE_TYPE_CHOICE_FUZZY: 50,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type TFUZZY_SCORE_LIMIT = typeof TFUZZY_SCORE_LIMIT[keyof typeof TFUZZY_SCORE_LIMIT];
