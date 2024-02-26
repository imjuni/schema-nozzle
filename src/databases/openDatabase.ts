import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { TTruncateSchemaOption } from '#/configs/interfaces/TTruncateSchemaOption';
import { getDatabaseFilePath } from '#/databases/getDatabaseFilePath';
import type { TDatabase } from '#/modules/interfaces/TDatabase';
import { safeParse } from '#/tools/safeParse';
import fs from 'fs/promises';
import { exists } from 'my-node-fp';

export async function openDatabase(
  option:
    | Pick<TAddSchemaOption, 'output'>
    | Pick<TRefreshSchemaOption, 'output'>
    | Pick<TDeleteSchemaOption, 'output'>
    | Pick<TTruncateSchemaOption, 'output'>,
) {
  const dbPath = await getDatabaseFilePath(option);

  const rawDb = (await exists(dbPath)) ? (await fs.readFile(dbPath)).toString() : '{}';

  const db = safeParse<TDatabase>(rawDb);

  if (db.type === 'fail') throw db.fail;

  return db.pass;
}
