/* eslint-disable no-console */
import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { CreateJSONSchemaError } from '#/errors/CreateJsonSchemaError';
import { container } from '#/modules/containers/container';
import { SYMBOL_KEY_APP_CONFIG } from '#/modules/containers/keys';
import chalk from 'chalk';

export function showFailMessage(errors: Readonly<CreateJSONSchemaError>[]) {
  const options = container.resolve<TAddSchemaOption | TRefreshSchemaOption | TDeleteSchemaOption>(
    SYMBOL_KEY_APP_CONFIG,
  );

  if (errors.length <= 0) {
    return;
  }

  console.log('\n');

  errors.forEach((error) => {
    console.log(chalk.bgRed(`   ERROR   `), error.message);
    console.log(chalk.redBright(`   ⌎ ${error.typeName}`), error.filePath);

    if (options.verbose) {
      console.log(chalk.redBright(`   STACK   `), error.stack);
    }
  });
}
