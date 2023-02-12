import type IDatabaseRecord from '#modules/interfaces/IDatabaseRecord';
import type { CE_MASTER_ACTION } from '#workers/interfaces/CE_MASTER_ACTION';
import type { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type * as tjsg from 'ts-json-schema-generator';

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
      command: Exclude<CE_WORKER_ACTION, typeof CE_WORKER_ACTION.SUMMARY_SCHEMA_FILES>;
      result: 'pass';
      id: number;
      data?: undefined;
    }
  | {
      command: typeof CE_WORKER_ACTION.GENERATOR_OPTION_LOAD;
      result: 'pass';
      id: number;
      data: tjsg.Config;
    }
  | {
      command: typeof CE_WORKER_ACTION.CREATE_JSON_SCHEMA;
      result: 'pass';
      id: number;
      data: IDatabaseRecord[];
    };

export interface IFailWorkerToMasterTaskComplete {
  command: CE_WORKER_ACTION;
  result: 'fail';
  id: number;
  error: Error;
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

export default interface IWorkerToMasterMessage {
  command: typeof CE_MASTER_ACTION.TASK_COMPLETE;
  data: IFailWorkerToMasterTaskComplete | TPassWorkerToMasterTaskComplete;
}
