import type IDatabaseRecord from '#modules/interfaces/IDatabaseRecord';
import type { CE_MASTER_ACTION } from '#workers/interfaces/CE_MASTER_ACTION';
import type { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type ora from 'ora';

export type TPassWorkerToMasterTaskComplete = {
  command: CE_WORKER_ACTION;
  result: 'pass';
  id: number;
};

export type TFailWorkerToMasterTaskComplete = {
  command: CE_WORKER_ACTION;
  result: 'fail';
  id: number;
  error: Error;
};

type TWorkerToMasterMessage =
  | { command: typeof CE_MASTER_ACTION.PROJECT_LOAD_PASS; data: undefined }
  | {
      command: typeof CE_MASTER_ACTION.TASK_COMPLETE;
      data: TFailWorkerToMasterTaskComplete | TPassWorkerToMasterTaskComplete;
    }
  | { command: 'record'; data: IDatabaseRecord[] }
  | { command: 'kill-me' }
  | {
      command: 'message';
      data: string;
      channel?: keyof Pick<ora.Ora, 'succeed' | 'fail' | 'info'>;
    };

export function isPassTaskComplete(
  value: TFailWorkerToMasterTaskComplete | TPassWorkerToMasterTaskComplete,
): value is TPassWorkerToMasterTaskComplete {
  return value.result === 'pass';
}

export function isFailTaskComplete(
  value: TFailWorkerToMasterTaskComplete | TPassWorkerToMasterTaskComplete,
): value is TFailWorkerToMasterTaskComplete {
  return value.result === 'fail';
}

export default TWorkerToMasterMessage;
