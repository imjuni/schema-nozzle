import { progress } from '#/cli/display/progress';
import { CE_DEFAULT_VALUE } from '#/configs/interfaces/CE_DEFAULT_VALUE';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import type { CE_MASTER_ACTION } from '#/workers/interfaces/CE_MASTER_ACTION';
import { CE_WORKER_ACTION } from '#/workers/interfaces/CE_WORKER_ACTION';
import type { TMasterToWorkerMessage } from '#/workers/interfaces/TMasterToWorkerMessage';
import type {
  IFailWorkerToMasterTaskComplete,
  TWorkerToMasterMessage,
} from '#/workers/interfaces/TWorkerToMasterMessage';
import type { Worker } from 'cluster';
import consola from 'consola';
import dayjs from 'dayjs';
import fastCopy from 'fast-copy';
import { atOrUndefined } from 'my-easy-fp';
import { EventEmitter } from 'node:events';

class Workers extends EventEmitter {
  #workers: Worker[];

  #finished: number;

  #records: IDatabaseItem[];

  #reply: Extract<
    TWorkerToMasterMessage,
    { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }
  >['data'][];

  constructor() {
    super();

    this.#workers = [];
    this.#records = [];
    this.#finished = 0;

    this.#reply = [];
  }

  get finished() {
    return this.#finished;
  }

  get records() {
    return this.#records;
  }

  inc() {
    this.#finished += 1;
  }

  dec() {
    if (this.#finished - 1 >= 0) {
      this.#finished -= 1;
    } else {
      consola.trace(`invalid #finished: ${this.#finished}`);
      this.#finished = 0;
    }
  }

  add(worker: Worker) {
    worker.on('message', (message: TWorkerToMasterMessage) => {
      if (message.command === 'progress-update') {
        progress.increment(message.data.schemaName);
        return;
      }

      this.#reply.push(message.data);
      this.dec();
      consola.trace(`received: ${this.finished} ${message.command}>${message.data.command}`);
    });

    this.#workers.push(worker);
  }

  send(...jobs: TMasterToWorkerMessage[]) {
    this.#reply = [];

    jobs.forEach((job, index, arr) => {
      const pos = index % Object.keys(this.#workers).length;
      this.#workers[pos]?.send(job);
      this.inc();
      consola.trace(
        `send[${this.#finished}][${index}/${arr.length}]: ${this.#workers[pos]?.id ?? ''}`,
      );
    });
  }

  broadcast(job: TMasterToWorkerMessage) {
    this.#reply = [];

    this.#workers.forEach((worker, index, arr) => {
      worker.send(job);
      this.inc();
      consola.trace(`sendAll[${this.#finished}][${index}/${arr.length}]: ${worker.id}`);
    });
  }

  wait(waitSecond?: number) {
    return new Promise<{
      cluster: number;
      data: Extract<
        TWorkerToMasterMessage,
        { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }
      >['data'][];
    }>((resolve) => {
      const startAt = dayjs();

      const intervalHandle = setInterval(() => {
        if (this.#finished === 0) {
          clearInterval(intervalHandle);

          const result = fastCopy(this.#reply);
          this.#reply = [];

          resolve({ cluster: this.#finished, data: result });
        }

        const currentAt = dayjs();

        // timeout, wait 30 second
        if (
          currentAt.diff(startAt, 'seconds') >
          (waitSecond ?? CE_DEFAULT_VALUE.DEFAULT_TASK_WAIT_SECOND)
        ) {
          clearInterval(intervalHandle);

          const err = new Error('exceeded generator-timeout option');
          const result = [
            {
              command: atOrUndefined(this.#reply, 0)?.command ?? CE_WORKER_ACTION.NOOP,
              result: 'fail',
              id: atOrUndefined(this.#reply, 0)?.id ?? -1,
              error: {
                kind: 'error',
                message: err.message,
                stack: err.stack,
              },
            } satisfies IFailWorkerToMasterTaskComplete,
            ...fastCopy(this.#reply),
          ];

          this.#reply = [];

          resolve({ cluster: this.#finished, data: result });
        }
      }, 200);
    });
  }
}

export const workers = new Workers();
