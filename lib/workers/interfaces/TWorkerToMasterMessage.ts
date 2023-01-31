import type IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import type { CE_MASTER_ACTION } from '@workers/interfaces/CE_MASTER_ACTION';
import type ora from 'ora';

type TWorkerToMasterMessage =
  | { command: typeof CE_MASTER_ACTION.PROJECT_LOAD_PASS; data: undefined }
  | {
      command: typeof CE_MASTER_ACTION.PROJECT_LOAD_FAIL;
      data: { message: string; stack?: string; name?: string };
    }
  | { command: 'record'; data: IDatabaseRecord[] }
  | { command: 'kill-me' }
  | {
      command: 'message';
      data: string;
      channel?: keyof Pick<ora.Ora, 'succeed' | 'fail' | 'info'>;
    };

export default TWorkerToMasterMessage;
