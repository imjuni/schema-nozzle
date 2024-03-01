export const CE_OUTPUT_FORMAT = {
  JSON: 'json',
  STRING: 'string',
  BASE64: 'base64',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_OUTPUT_FORMAT = (typeof CE_OUTPUT_FORMAT)[keyof typeof CE_OUTPUT_FORMAT];
