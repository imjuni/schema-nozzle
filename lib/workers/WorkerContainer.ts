import spinner from '@cli/spinner';
import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import TChildToParentData from '@workers/interfaces/TChildToParentData';
import TParentToChildData from '@workers/interfaces/TParentToChildData';
import { Worker } from 'cluster';
import dayjs from 'dayjs';

class WorkerContainerClass {
  #workers: Worker[];

  #finished: number;

  #jobCount: number;

  #records: IDatabaseRecord[];

  constructor() {
    this.#workers = [];
    this.#finished = 0;
    this.#jobCount = 0;
    this.#records = [];
  }

  get finished() {
    return this.#finished;
  }

  get jobCount() {
    return this.#jobCount;
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
        this.#jobCount -= 1;
      }

      if (message.command === 'message') {
        spinner.update({ message: message.data, channel: message.channel ?? 'succeed' });
      }
    });

    this.#workers.push(worker);
    this.#finished += 1;
  }

  send(...jobs: TParentToChildData[]) {
    this.#jobCount = jobs.length;
    jobs.forEach((job, index) => this.#workers[index % this.#workers.length].send(job));
    this.#workers.forEach((worker) => worker.send({ command: 'start' }));
  }

  wait(): Promise<number> {
    return new Promise<number>((resolve) => {
      const startAt = dayjs();

      const intervalHandle = setInterval(() => {
        if (this.#finished === 0 && this.#jobCount === 0) {
          clearInterval(intervalHandle);
          resolve(this.#workers.length);
        }

        const currentAt = dayjs();

        // timeout, wait 30 second
        if (currentAt.diff(startAt, 'second') > 30) {
          clearInterval(intervalHandle);
          resolve(this.#finished + this.#jobCount);
        }
      }, 300);
    });
  }
}

const WorkerContainer = new WorkerContainerClass();

export default WorkerContainer;
