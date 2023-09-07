import type TAddSchemaOption from 'src/configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from 'src/configs/interfaces/TRefreshSchemaOption';
import type TWatchSchemaOption from 'src/configs/interfaces/TWatchSchemaOption';
import type { CE_WATCH_EVENT } from 'src/modules/interfaces/CE_WATCH_EVENT';
import type { CE_WORKER_ACTION } from 'src/workers/interfaces/CE_WORKER_ACTION';

type TMasterToWorkerMessage =
  | { command: typeof CE_WORKER_ACTION.PROJECT_LOAD }
  | {
      command: typeof CE_WORKER_ACTION.OPTION_LOAD;
      data: {
        option: TAddSchemaOption | TRefreshSchemaOption | TWatchSchemaOption;
      };
    }
  | { command: typeof CE_WORKER_ACTION.PROJECT_DIAGONOSTIC }
  // schema file, exported type command
  | { command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES }
  | { command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES }
  | { command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILE_TYPE }
  | { command: typeof CE_WORKER_ACTION.LOAD_DATABASE }
  // schema command
  | {
      command: typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA;
      data: { filePath: string; exportedType: string };
    }
  | {
      command: typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK;
      data: { filePath: string; exportedType: string }[];
    }
  // watch command
  | {
      command: typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD;
      data: { kind: CE_WATCH_EVENT; filePath: string };
    }
  | {
      command: typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE;
      data: { kind: CE_WATCH_EVENT; filePath: string };
    }
  | {
      command: typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK;
      data: { kind: CE_WATCH_EVENT; filePath: string };
    }
  | {
      command: typeof CE_WORKER_ACTION.WATCH_SOURCE_EVENT_FILE_SUMMARY;
      data: { filePaths: string[] };
    }
  // misc command
  | { command: typeof CE_WORKER_ACTION.TERMINATE }
  | { command: typeof CE_WORKER_ACTION.NOOP };

export type TPickMasterToWorkerMessage<T extends CE_WORKER_ACTION> = Extract<
  TMasterToWorkerMessage,
  { command: T }
>;

export default TMasterToWorkerMessage;
