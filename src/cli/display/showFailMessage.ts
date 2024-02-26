/* eslint-disable no-console */
import type { TFailData } from '#/workers/interfaces/TWorkerToMasterMessage';
import chalk from 'chalk';

export function showFailMessage(data: TFailData[]) {
  console.log('\n');

  data.forEach((message) => {
    if (message.kind === 'error') {
      console.log(chalk.bgRed(`   ERROR   `), message.message);
    } else {
      console.log(chalk.bgRed(`   ERROR   `), message.message);
      console.log(chalk.redBright(`   ⌎ ${message.exportedType}`), message.filePath);
    }
  });
}
