import spinner from '@cli/spinner';
import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import TChildToParentData from '@workers/interfaces/TChildToParentData';
import { Worker } from 'cluster';
import dayjs from 'dayjs';

class WorkerContainerClass {
  #workers: Worker[];

  #finished: number;

  #records: IDatabaseRecord[];

  constructor() {
    this.#workers = [];
    this.#finished = 0;
    this.#records = [];
  }

  get workers() {
    return this.#workers;
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

    worker.on('message', (message: TChildToParentData) => {
      if (message.command === 'record') {
        this.#records.push(...message.data);
      }

      if (message.command === 'message') {
        spinner.update({ message: message.data, channel: message.channel ?? 'succeed' });
      }
    });

    this.#workers.push(worker);
    this.#finished += 1;
  }

  wait(): Promise<number> {
    return new Promise<number>((resolve) => {
      const startAt = dayjs();

      const intervalHandle = setInterval(() => {
        if (this.#finished === 0) {
          clearInterval(intervalHandle);
          resolve(this.#workers.length);
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
