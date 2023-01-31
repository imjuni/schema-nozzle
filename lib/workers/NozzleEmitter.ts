import getTsProject from '@compilers/getTsProject';
import { CE_MASTER_ACTION } from '@workers/interfaces/CE_MASTER_ACTION';
import { CE_WORKER_ACTION } from '@workers/interfaces/CE_WORKER_ACTION';
import type TMasterToWorkerMessage from '@workers/interfaces/TMasterToWorkerMessage';
import type TWorkerToMasterMessage from '@workers/interfaces/TWorkerToMasterMessage';
import { EventEmitter } from 'node:events';
import type * as tsm from 'ts-morph';

export default class NozzleEmitter extends EventEmitter {
  accessor project: tsm.Project | undefined;

  constructor(args?: { ee: ConstructorParameters<typeof EventEmitter>[0] }) {
    super(args?.ee);

    this.project = undefined;

    process.on('SIGTERM', NozzleEmitter.terminate);

    this.on(CE_WORKER_ACTION.PROJECT_LOAD, this.loadProject.bind(this));
  }

  static terminate(code?: number) {
    process.exit(code ?? 0);
  }

  working(payload: TMasterToWorkerMessage) {
    this.emit(payload.command, payload.data);
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
