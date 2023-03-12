import type IDatabaseItem from '#modules/interfaces/IDatabaseItem';
import type { CE_MASTER_ACTION } from '#workers/interfaces/CE_MASTER_ACTION';
import type { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';

export type TPassWorkerToMasterTaskComplete =
  | {
      command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES;
      result: 'pass';
      id: number;
      data: { origin: string; refined: string }[];
    }
  | {
      command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_TYPES;
      result: 'pass';
      id: number;
      data: { identifier: string; filePath: string }[];
    }
  | {
      command: typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILE_TYPE;
      result: 'pass';
      id: number;
      data: { identifier: string; filePath: string }[];
    }
  | {
      command: Exclude<CE_WORKER_ACTION, typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES>;
      result: 'pass';
      id: number;
      data?: undefined;
    }
  | {
      command: typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA;
      result: 'pass';
      id: number;
      data: IDatabaseItem[];
    }
  | {
      command: typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA_BULK;
      result: 'pass';
      id: number;
      data: {
        pass: IDatabaseItem[];
        fail: Extract<TFailData, { kind: 'json-schema-generate' }>[];
      };
    }
  | {
      command: typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD;
      result: 'pass';
      id: number;
      data: { filePath: string; identifier: string }[];
    }
  | {
      command: typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE;
      result: 'pass';
      id: number;
      data: { filePath: string; identifier: string }[];
    }
  | {
      command: typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_UNLINK;
      result: 'pass';
      id: number;
      data: { filePath: string; identifier: string }[];
    }
  | {
      command: typeof CE_WORKER_ACTION.WATCH_SOURCE_EVENT_FILE_SUMMARY;
      result: 'pass';
      id: number;
      data: { updateFiles: string[]; deleteFiles: string[] };
    };

export type TPickPassWorkerToMasterTaskComplete<T> = Extract<
  TPassWorkerToMasterTaskComplete,
  { command: T }
>;

export type TFailData =
  | {
      kind: 'error';
      message: string;
      stack?: string;
    }
  | {
      kind: 'json-schema-generate';
      message: string;
      stack?: string;
      filePath: string;
      exportedType: string;
    };

export interface IFailWorkerToMasterTaskComplete {
  command: CE_WORKER_ACTION;
  result: 'fail';
  id: number;
  // master/worker cannot send error class, send error message and stack
  error: TFailData;
}

export function isPassTaskComplete(
  value: IFailWorkerToMasterTaskComplete | TPassWorkerToMasterTaskComplete,
): value is TPassWorkerToMasterTaskComplete {
  return value.result === 'pass';
}

export function isFailTaskComplete(
  value: IFailWorkerToMasterTaskComplete | TPassWorkerToMasterTaskComplete,
): value is IFailWorkerToMasterTaskComplete {
  return value.result === 'fail';
}

type TWorkerToMasterMessage =
  | {
      command: typeof CE_MASTER_ACTION.TASK_COMPLETE;
      data: IFailWorkerToMasterTaskComplete | TPassWorkerToMasterTaskComplete;
    }
  | {
      command: typeof CE_MASTER_ACTION.PROGRESS_UPDATE;
      data: {
        schemaName: string;
      };
    };

export default TWorkerToMasterMessage;
