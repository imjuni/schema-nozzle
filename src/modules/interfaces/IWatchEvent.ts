import type { CE_WATCH_EVENT } from '#/modules/const-enum/CE_WATCH_EVENT';

export interface IWatchEvent {
  /**
   * event kind
   */
  kind: CE_WATCH_EVENT;

  /**
   * file path of event triggered. file path must be a resolved(absolute path)
   */
  filePath: string;
}
