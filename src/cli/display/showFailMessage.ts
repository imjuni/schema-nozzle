/* eslint-disable no-console */

import chalk from 'chalk';
import type { TFailData } from 'src/workers/interfaces/TWorkerToMasterMessage';

export default function showFailMessage(data: TFailData[]) {
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
