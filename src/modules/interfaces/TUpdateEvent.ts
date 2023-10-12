import type getExportedTypes from '#/compilers/getExportedTypes';
import type { CE_WATCH_EVENT } from '#/modules/interfaces/CE_WATCH_EVENT';
import type IDatabaseItem from '#/modules/interfaces/IDatabaseItem';
import type { LastArrayElement } from 'type-fest';

type TUpdateEvent =
  | {
      /**
       * event kind
       */
      kind: typeof CE_WATCH_EVENT.ADD | typeof CE_WATCH_EVENT.CHANGE;

      /**
       * file path of event triggered. file path must be a resolved(absolute path)
       */
      items: IDatabaseItem[];
    }
  | {
      /**
       * event kind
       */
      kind: typeof CE_WATCH_EVENT.UNLINK;

      /**
       * file path of event triggered. file path must be a resolved(absolute path)
       */
      exportedTypes: Pick<
        LastArrayElement<ReturnType<typeof getExportedTypes>>,
        'filePath' | 'identifier'
      >[];
    };

export default TUpdateEvent;
