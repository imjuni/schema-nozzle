import TStreamType from '@cli/interfaces/TStreamType';
import ora from 'ora';

class Spinner {
  #spinner: ora.Ora;

  #stream: TStreamType;

  #isEnable: boolean;

  #isStart: boolean;

  constructor(stream?: TStreamType) {
    this.#spinner = ora({ text: '', stream: process.stdout });
    this.#isEnable = false;
    this.#stream = stream ?? 'stdout';
    this.#isStart = false;
  }

  set stream(value: TStreamType) {
    if (value === 'stderr' && this.#stream === 'stdout') {
      this.#spinner.stop();
      this.#isStart = false;
      this.#spinner = ora({ text: this.#spinner.text, stream: process.stderr });

      this.#stream = 'stderr';
    } else if (value === 'stdout' && this.#stream === 'stderr') {
      this.#spinner.stop();
      this.#isStart = false;
      this.#spinner = ora({ text: this.#spinner.text, stream: process.stdout });

      this.#stream = 'stdout';
    }
  }

  get isEnable() {
    return this.#isEnable;
  }

  set isEnable(value) {
    this.#isEnable = value;
  }

  start(message?: string) {
    if (this.#isEnable && message != null) {
      this.#spinner.text = message;
      this.#spinner.start();
      this.#isStart = true;
    } else if (this.#isEnable) {
      this.#spinner.start();
      this.#isStart = true;
    }
  }

  update(message: string) {
    if (this.#isEnable) {
      this.#spinner.text = message;
    }
  }

  stop(display?: { message: string; channel: keyof Pick<ora.Ora, 'succeed' | 'fail' | 'info'> }) {
    if (this.#isStart === true && display != null) {
      this.#spinner[display.channel](display.message);
      this.#spinner.stopAndPersist();
      this.#isStart = false;
    } else if (this.#isStart === true) {
      this.#spinner.stopAndPersist();
      this.#isStart = false;
    }
  }
}

const spinner = new Spinner();

export default spinner;
