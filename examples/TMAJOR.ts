export const TMAJOR = {
  CS: 'computer science',
  ELECTRICAL: 'electrical',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TMAJOR = typeof TMAJOR[keyof typeof TMAJOR];
