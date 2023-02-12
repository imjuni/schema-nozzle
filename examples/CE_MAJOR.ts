export const CE_MAJOR = {
  CS: 'computer science',
  ELECTRICAL: 'electrical',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_MAJOR = (typeof CE_MAJOR)[keyof typeof CE_MAJOR];
