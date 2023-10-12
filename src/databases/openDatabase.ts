import { CE_DEFAULT_VALUE } from '#/configs/interfaces/CE_DEFAULT_VALUE';
import type TAddSchemaOption from '#/configs/interfaces/TAddSchemaOption';
import type TDeleteSchemaOption from '#/configs/interfaces/TDeleteSchemaOption';
import type TRefreshSchemaOption from '#/configs/interfaces/TRefreshSchemaOption';
import type TTruncateSchemaOption from '#/configs/interfaces/TTruncateSchemaOption';
import type { TDatabase } from '#/modules/interfaces/TDatabase';
import safeParse from '#/tools/safeParse';
import fs from 'fs/promises';
import { exists, isDirectory } from 'my-node-fp';
import path from 'path';

export default async function openDatabase(
  option:
    | Pick<TAddSchemaOption, 'output'>
    | Pick<TRefreshSchemaOption, 'output'>
    | Pick<TDeleteSchemaOption, 'output'>
    | Pick<TTruncateSchemaOption, 'output'>,
) {
  const dbPath = (await isDirectory(option.output))
    ? path.join(option.output, CE_DEFAULT_VALUE.DB_FILE_NAME)
    : option.output;

  const rawDb = (await exists(dbPath)) ? (await fs.readFile(dbPath)).toString() : '{}';

  const db = safeParse<TDatabase>(rawDb);

  if (db.type === 'fail') throw db.fail;

  return db.pass;
}
