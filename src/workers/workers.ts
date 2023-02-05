import type IDatabaseRecord from '#modules/interfaces/IDatabaseRecord';
import logger from '#tools/logger';
import { CE_MASTER_ACTION } from '#workers/interfaces/CE_MASTER_ACTION';
import type TMasterToWorkerMessage from '#workers/interfaces/TMasterToWorkerMessage';
import type TWorkerToMasterMessage from '#workers/interfaces/TWorkerToMasterMessage';
import type { Worker } from 'cluster';
import dayjs from 'dayjs';
import { EventEmitter } from 'node:events';

const log = logger();

class Workers extends EventEmitter {
  #workers: Record<number, Worker>;

  #deaded: Record<number, Worker>;

  #finished: number;

  #records: IDatabaseRecord[];

  #reply: Array<
    Extract<TWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>['data']
  >;

  constructor() {
    super();

    this.#workers = {};
    this.#deaded = {};

    this.#finished = 0;
    this.#records = [];

    this.#reply = [];
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
      log.trace(`received: ${this.finished} ${message.command}> ${JSON.stringify(message)}`);

      if (message.command === CE_MASTER_ACTION.TASK_COMPLETE) {
        this.#reply.push(message.data);
        this.#finished -= 1;
      }
    });

    this.#workers[worker.id] = worker;
    // this.#finished += 1;
  }

  send(...jobs: TMasterToWorkerMessage[]) {
    this.#reply = [];

    jobs.forEach((job, index) =>
      this.#workers[index % Object.keys(this.#workers).length].send(job),
    );
  }

  sendAll(job: TMasterToWorkerMessage) {
    this.#reply = [];

    Object.values(this.#workers).forEach((worker, index, arr) => {
      worker.send(job);
      this.#finished += 1;
      log.trace(`sendAll[${this.#finished}][${index}/${arr.length}]: ${worker.id}`);
    });
  }

  wait() {
    return new Promise<{
      cluster: number;
      data: Array<
        Extract<TWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>['data']
      >;
    }>((resolve) => {
      const startAt = dayjs();

      const intervalHandle = setInterval(() => {
        if (this.#finished === 0) {
          clearInterval(intervalHandle);
          log.trace(`reply: >> ${JSON.stringify(this.#reply)}`);
          resolve({ cluster: this.#finished, data: this.#reply });
        }

        const currentAt = dayjs();

        // timeout, wait 30 second
        if (currentAt.diff(startAt, 'second') > 30) {
          clearInterval(intervalHandle);
          resolve({ cluster: this.#finished, data: this.#reply });
        }
      }, 300);
    });
  }
}

const workers = new Workers();

export default workers;
