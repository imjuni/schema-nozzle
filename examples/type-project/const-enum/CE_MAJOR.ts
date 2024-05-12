export const CE_MAJOR = {
  CS: 'computer science',
  ELECTRICAL: 'electrical',
} as const;

export type CE_MAJOR = (typeof CE_MAJOR)[keyof typeof CE_MAJOR];
