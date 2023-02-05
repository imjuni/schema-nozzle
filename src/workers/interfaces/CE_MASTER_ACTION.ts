export const CE_MASTER_ACTION = {
  PROJECT_LOAD_PASS: 'project-load-pass',
  TASK_COMPLETE: 'task-complete',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_MASTER_ACTION = (typeof CE_MASTER_ACTION)[keyof typeof CE_MASTER_ACTION];
