import getDiagnostics from '#compilers/getDiagnostics';
import getTsProject from '#compilers/getTsProject';
import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import logger from '#tools/logger';
import { CE_MASTER_ACTION } from '#workers/interfaces/CE_MASTER_ACTION';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type TMasterToWorkerMessage from '#workers/interfaces/TMasterToWorkerMessage';
import type { TPickMasterToWorkerMessage } from '#workers/interfaces/TMasterToWorkerMessage';
import type TWorkerToMasterMessage from '#workers/interfaces/TWorkerToMasterMessage';
import { isError } from 'my-easy-fp';
import { EventEmitter } from 'node:events';
import type * as tsm from 'ts-morph';

const log = logger();

export default class NozzleEmitter extends EventEmitter {
  accessor project: tsm.Project | undefined;

  accessor option: TAddSchemaOption | TRefreshSchemaOption | undefined;

  accessor resolvedPaths: IResolvedPaths | undefined;

  accessor id: number = 0;

  constructor(args?: { ee: ConstructorParameters<typeof EventEmitter>[0] }) {
    super(args?.ee);

    this.project = undefined;

    process.on('SIGTERM', NozzleEmitter.terminate);

    this.on(
      CE_WORKER_ACTION.OPTION_LOAD,
      (payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.OPTION_LOAD>['data']) => {
        this.loadOption(payload);
      },
    );

    this.on(CE_WORKER_ACTION.TERMINATE, () => {
      NozzleEmitter.terminate(0);
    });

    this.on(CE_WORKER_ACTION.PROJECT_LOAD, () => {
      this.loadProject().catch((catched) => {
        const err = isError(catched, new Error('unknown error raised'));
        log.error(err.message);
        log.error(err.stack);
      });
    });

    this.on(CE_WORKER_ACTION.PROJECT_DIAGOSTIC, () => {
      this.diagonostic().catch((catched) => {
        const err = isError(catched, new Error('unknown error raised'));
        log.error(err.message);
        log.error(err.stack);
      });
    });
  }

  static terminate(this: void, code?: number) {
    process.exit(code ?? 0);
  }

  working(payload: TMasterToWorkerMessage) {
    this.emit(payload.command);
  }

  loadOption(payload: TPickMasterToWorkerMessage<typeof CE_WORKER_ACTION.OPTION_LOAD>['data']) {
    this.option = payload.option;
    this.resolvedPaths = payload.resolvedPaths;

    process.send?.({
      command: CE_MASTER_ACTION.TASK_COMPLETE,
      data: { id: this.id, result: 'pass', command: CE_WORKER_ACTION.OPTION_LOAD },
    } satisfies Extract<TWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
  }

  async diagonostic() {
    if (this.project != null && this.option != null) {
      const diagnostics = getDiagnostics({ option: this.option, project: this.project });

      if (diagnostics.type === 'fail') {
        process.send?.({
          command: CE_MASTER_ACTION.TASK_COMPLETE,
          data: {
            id: this.id,
            result: 'fail',
            command: CE_WORKER_ACTION.PROJECT_DIAGOSTIC,
            error: new Error('project compile fail'),
          },
        } satisfies Extract<TWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
      } else {
        process.send?.({
          command: CE_MASTER_ACTION.TASK_COMPLETE,
          data: {
            id: this.id,
            result: 'pass',
            command: CE_WORKER_ACTION.PROJECT_DIAGOSTIC,
          },
        } satisfies Extract<TWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
      }
    } else {
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          id: this.id,
          result: 'fail',
          command: CE_WORKER_ACTION.PROJECT_DIAGOSTIC,
          error: new Error('empty project or option'),
        },
      } satisfies Extract<TWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
    }
  }

  async loadProject() {
    const projectPath = this.option?.project;

    if (projectPath == null) {
      // send message to master process
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.PROJECT_LOAD,
          id: this.id,
          result: 'fail',
          error: new Error('project load fail: empty project path'),
        },
      } satisfies TWorkerToMasterMessage);

      process.exit(1);
    }

    const project = await getTsProject({ tsConfigFilePath: projectPath });

    if (project.type === 'fail') {
      // send message to master process
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.PROJECT_LOAD,
          id: this.id,
          result: 'fail',
          error: new Error('project load fail: empty project path'),
        },
      } satisfies TWorkerToMasterMessage);

      process.exit(1);
    }

    this.project = project.pass;

    process.send?.({
      command: CE_MASTER_ACTION.TASK_COMPLETE,
      data: {
        command: CE_WORKER_ACTION.PROJECT_LOAD,
        id: this.id,
        result: 'pass',
      },
    } satisfies TWorkerToMasterMessage);
  }

  // async summaryTargetFile() {
  //   const ig = await summaryTargetFiles(this.option);
  // }
}
