/**
 * kind of chokidar event
 */
export const CE_WATCH_EVENT = {
  /** file add */
  ADD: 'add',

  /** file change */
  CHANGE: 'change',

  /** file unlink(delete) */
  UNLINK: 'unlink',
} as const;

export type CE_WATCH_EVENT = (typeof CE_WATCH_EVENT)[keyof typeof CE_WATCH_EVENT];
