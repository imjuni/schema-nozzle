/* eslint-disable no-console */
import type { CreateJSONSchemaError } from '#/errors/CreateJsonSchemaError';
import chalk from 'chalk';

export function showFailMessage(errors: Readonly<CreateJSONSchemaError>[]) {
  if (errors.length <= 0) {
    return;
  }

  console.log('\n');

  errors.forEach((error) => {
    console.log(chalk.bgRed(`   ERROR   `), error.message);
    console.log(chalk.redBright(`   ⌎ ${error.typeName}`), error.filePath);
  });
}
