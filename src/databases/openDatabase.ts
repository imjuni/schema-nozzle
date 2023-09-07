import fs from 'fs/promises';
import { exists, isDirectory } from 'my-node-fp';
import path from 'path';
import { CE_DEFAULT_VALUE } from 'src/configs/interfaces/CE_DEFAULT_VALUE';
import type TAddSchemaOption from 'src/configs/interfaces/TAddSchemaOption';
import type TDeleteSchemaOption from 'src/configs/interfaces/TDeleteSchemaOption';
import type TRefreshSchemaOption from 'src/configs/interfaces/TRefreshSchemaOption';
import type TTruncateSchemaOption from 'src/configs/interfaces/TTruncateSchemaOption';
import type { TDatabase } from 'src/modules/interfaces/TDatabase';
import safeParse from 'src/tools/safeParse';

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
