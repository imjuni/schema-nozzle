export const CE_WORKER_ACTION = {
  PROJECT_LOAD: 'project-load',
  OPTION_LOAD: 'option-load',
  SUMMARY_TARGET: 'summary-target',
  PROJECT_DIAGOSTIC: 'project-diagostic',
  NOOP: 'noop',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_WORKER_ACTION = (typeof CE_WORKER_ACTION)[keyof typeof CE_WORKER_ACTION];
