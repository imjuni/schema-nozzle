export const TOUTPUT_FORMAT = {
  JSON: 'json',
  STRING: 'string',
  BASE64: 'base64',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type TOUTPUT_FORMAT = (typeof TOUTPUT_FORMAT)[keyof typeof TOUTPUT_FORMAT];
