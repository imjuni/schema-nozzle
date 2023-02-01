import getDiagnostics from '#compilers/getDiagnostics';
import getTsProject from '#compilers/getTsProject';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import logger from '#tools/logger';
import { CE_MASTER_ACTION } from '#workers/interfaces/CE_MASTER_ACTION';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type TMasterToWorkerMessage from '#workers/interfaces/TMasterToWorkerMessage';
import type TWorkerToMasterMessage from '#workers/interfaces/TWorkerToMasterMessage';
import { isError } from 'my-easy-fp';
import { EventEmitter } from 'node:events';
import type * as tsm from 'ts-morph';

const log = logger();

export default class NozzleEmitter extends EventEmitter {
  accessor project: tsm.Project | undefined;

  accessor option: TAddSchemaOption | TRefreshSchemaOption | undefined;

  accessor id: number = 0;

  constructor(args?: { ee: ConstructorParameters<typeof EventEmitter>[0] }) {
    super(args?.ee);

    this.project = undefined;

    process.on('SIGTERM', NozzleEmitter.terminate);

    this.on(
      CE_WORKER_ACTION.PROJECT_LOAD,
      (
        payload: Extract<
          TMasterToWorkerMessage,
          { command: typeof CE_WORKER_ACTION.PROJECT_LOAD }
        >['data'],
      ) => {
        this.loadProject(payload).catch((catched) => {
          const err = isError(catched, new Error('unknown error raised'));
          log.error(err.message);
          log.error(err.stack);
        });
      },
    );
  }

  static terminate(this: void, code?: number) {
    process.exit(code ?? 0);
  }

  working(payload: TMasterToWorkerMessage) {
    this.emit(payload.command, payload.data);
  }

  async diagonostic(
    payload: Extract<
      TMasterToWorkerMessage,
      { command: typeof CE_WORKER_ACTION.PROJECT_DIAGOSTIC }
    >['data'],
  ) {
    if (this.project != null) {
      getDiagnostics({ option: payload.option, project: this.project });
    }

    process.send?.({
      command: CE_MASTER_ACTION.TASK_COMPLETE,
      data: { id: this.id, result: 'pass', command: CE_WORKER_ACTION.PROJECT_DIAGOSTIC },
    } satisfies Extract<TWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
  }

  async loadProject(
    payload: Extract<
      TMasterToWorkerMessage,
      { command: typeof CE_WORKER_ACTION.PROJECT_LOAD }
    >['data'],
  ) {
    const project = await getTsProject({ tsConfigFilePath: payload.project });

    if (project.type === 'fail') {
      // send message to master process
      process.send?.({
        command: CE_MASTER_ACTION.PROJECT_LOAD_FAIL,
        data: project.fail,
      } satisfies TWorkerToMasterMessage);

      process.exit(1);
    }

    this.project = project.pass;

    process.send?.({
      command: CE_MASTER_ACTION.PROJECT_LOAD_PASS,
      data: undefined,
    } satisfies TWorkerToMasterMessage);
  }
}
