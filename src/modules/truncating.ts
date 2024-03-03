import type { TTruncateSchemaOption } from '#/configs/interfaces/TTruncateSchemaOption';
import { dbBootstrap as lokiBootstrap, getDb as lokidb } from '#/databases/files/LokiDbContainer';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import fs from 'fs';

export async function truncating(option: TTruncateSchemaOption) {
  const dbPath = await getDatabaseFilePath(option);
  await fs.promises.unlink(dbPath);
  await lokiBootstrap({ filename: dbPath });
  await lokidb().save();
}
