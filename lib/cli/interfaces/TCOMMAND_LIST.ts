export const TCOMMAND_LIST = {
  ADD: 'add',
  DEL: 'del',
  REFRESH: 'refresh',
  TRUNCATE: 'truncate',
  ADD_ALIAS: 'a',
  DEL_ALIAS: 'd',
  REFRESH_ALIAS: 'r',
  TRUNCATE_ALIAS: 't',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type TCOMMAND_LIST = typeof TCOMMAND_LIST[keyof typeof TCOMMAND_LIST];
