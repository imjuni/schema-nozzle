import type IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import type IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import type ITruncateSchemaOption from '@configs/interfaces/ITruncateSchemaOption';
import type TAddSchemaOption from '@configs/interfaces/TAddSchemaOption';
import dbFileName from '@databases/interfaces/dbFileName';
import type { TDatabase } from '@modules/interfaces/TDatabase';
import fastSafeStringify from 'fast-safe-stringify';
import fs from 'fs';
import { isDirectory } from 'my-node-fp';
import path from 'path';

export default async function saveDatabase(
  option: TAddSchemaOption | IDeleteSchemaOption | ITruncateSchemaOption | IRefreshSchemaOption,
  db: TDatabase,
) {
  const dbPath = (await isDirectory(option.output))
    ? path.join(option.output, dbFileName)
    : option.output;

  const sortedDb = Object.values(db)
    .sort((l, r) => l.id.localeCompare(r.id))
    .reduce((aggregation, record) => {
      return { ...aggregation, [record.id]: record };
    }, {});

  await fs.promises.writeFile(dbPath, fastSafeStringify(sortedDb, undefined, 2));

  return db.pass;
}
