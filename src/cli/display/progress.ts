import chalk from 'chalk';
import cliProgesss from 'cli-progress';

class Progress {
  accessor isEnable: boolean;

  #bar: cliProgesss.SingleBar;

  constructor() {
    this.isEnable = false;

    this.#bar = new cliProgesss.SingleBar(
      {
        format: `PROGRESS | ${chalk.greenBright('{bar}')} | {value}/{total} Files {schemaName}`,
        barCompleteChar: '\u25A0',
        barIncompleteChar: '\u25A1',
        stopOnComplete: true,
        barGlue: '\u001b[37m',
      },
      cliProgesss.Presets.rect,
    );
  }

  start(total: number, startValue: number, schemaName?: string) {
    if (this.isEnable) {
      this.#bar.start(total, startValue, {
        schemaName: schemaName != null ? ` - ${schemaName}` : '',
      });
    }
  }

  increment(schemaName?: string) {
    if (this.isEnable) {
      this.#bar.increment(undefined, { schemaName: schemaName != null ? ` - ${schemaName}` : '' });
    }
  }

  update(updateValue: number, schemaName?: string) {
    if (this.isEnable) {
      this.#bar.update(updateValue, { schemaName: schemaName != null ? ` - ${schemaName}` : '' });
    }
  }

  stop() {
    if (this.isEnable) {
      this.#bar.stop();
    }
  }
}

export const progress = new Progress();
