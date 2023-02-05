import type { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';

type TTaskCompleteData = {
  command: CE_WORKER_ACTION;
  result: 'pass' | 'fail';
  id: number;
  error?: Error;
};

export default TTaskCompleteData;
