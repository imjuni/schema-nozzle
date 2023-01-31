import spinner from '@cli/spinner';
import type IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import { CE_MASTER_ACTION } from '@workers/interfaces/CE_MASTER_ACTION';
import type TMasterToWorkerMessage from '@workers/interfaces/TMasterToWorkerMessage';
import type TWorkerToMasterMessage from '@workers/interfaces/TWorkerToMasterMessage';
import type { Worker } from 'cluster';
import dayjs from 'dayjs';
import { EventEmitter } from 'node:events';

class WorkerContainerClass extends EventEmitter {
  #workers: Record<number, Worker>;

  #deaded: Record<number, Worker>;

  #finished: number;

  #records: IDatabaseRecord[];

  constructor() {
    super();

    this.#workers = {};
    this.#deaded = {};

    this.#finished = 0;
    this.#records = [];
  }

  get finished() {
    return this.#finished;
  }

  get records() {
    return this.#records;
  }

  add(worker: Worker) {
    worker.on('exit', () => {
      this.#finished -= 1;
    });

    worker.on('message', (message: TWorkerToMasterMessage) => {
      if (message.command === CE_MASTER_ACTION.PROJECT_LOAD_PASS) {
        this.#finished -= 1;
      }

      if (message.command === CE_MASTER_ACTION.PROJECT_LOAD_FAIL) {
        this.#finished -= 1;
      }

      if (message.command === 'record') {
        this.#records.push(...message.data);
      }

      if (message.command === 'message') {
        spinner.update({ message: message.data, channel: message.channel ?? 'succeed' });
      }

      if (message.command === 'kill-me') {
        worker.send({ command: 'end' });
      }
    });

    this.#workers[worker.id] = worker;
    this.#finished += 1;
  }

  loadProject(
    message:
      | (Extract<TWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.PROJECT_LOAD_PASS }> & {
          id: number;
        })
      | (Extract<TWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.PROJECT_LOAD_FAIL }> & {
          id: number;
        }),
  ) {
    if (message.command === CE_MASTER_ACTION.PROJECT_LOAD_FAIL) {
      const tmp = this.#workers[message.id];
      delete this.#workers[message.id];
      this.#deaded[message.id] = tmp;
    }

    this.#finished -= 1;
  }

  send(...jobs: TMasterToWorkerMessage[]) {
    jobs.forEach((job, index) =>
      this.#workers[index % Object.keys(this.#workers).length].send(job),
    );
  }

  wait(): Promise<number> {
    return new Promise<number>((resolve) => {
      const startAt = dayjs();

      const intervalHandle = setInterval(() => {
        if (this.#finished === 0) {
          clearInterval(intervalHandle);
          resolve(Object.keys(this.#workers).length);
        }

        const currentAt = dayjs();

        // timeout, wait 30 second
        if (currentAt.diff(startAt, 'second') > 30) {
          clearInterval(intervalHandle);
          resolve(this.#finished);
        }
      }, 300);
    });
  }
}

const WorkerContainer = new WorkerContainerClass();

export default WorkerContainer;
