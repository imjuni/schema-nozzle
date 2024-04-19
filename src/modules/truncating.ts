import { makeSpinner } from '#/cli/display/makeSpinner';
import type { TTruncateSchemaOption } from '#/configs/interfaces/TTruncateSchemaOption';
import { bootstrap as lokiBootstrap, getIt as lokidb } from '#/databases/files/LokiDbContainer';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import { exists } from 'find-up';
import { unlink } from 'fs/promises';

export async function truncating(option: TTruncateSchemaOption) {
  const spinner = makeSpinner();
  const dbPath = await getDatabaseFilePath(option);

  if (await exists(dbPath)) {
    spinner.start('truncate database, ...');
    await unlink(dbPath);
    spinner.stop('truncated database!', 'succeed');
  }
  lokiBootstrap({ filename: dbPath });
  await lokidb().save();
}
