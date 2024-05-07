import { makeSpinner } from '#/cli/display/makeSpinner';
import type { TTruncateSchemaOption } from '#/configs/interfaces/TTruncateSchemaOption';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import { exists } from 'find-up';
import { unlink } from 'fs/promises';

export async function truncating(options: TTruncateSchemaOption) {
  const spinner = makeSpinner();
  const dbPath = await getDatabaseFilePath(options);

  if (await exists(dbPath)) {
    spinner.start('truncate database, ...');
    await unlink(dbPath);
    spinner.stop('truncated database!', 'succeed');
  } else {
    spinner.stop('already truncated database', 'succeed');
  }
}
