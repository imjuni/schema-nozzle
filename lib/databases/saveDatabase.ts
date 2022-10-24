import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import dbFileName from '@databases/interfaces/dbFileName';
import { TNullableDatabase } from '@modules/interfaces/TDatabase';
import fastSafeStringify from 'fast-safe-stringify';
import fs from 'fs';
import { isDirectory } from 'my-node-fp';
import path from 'path';

export default async function saveDatabase(
  option: IAddSchemaOption | IDeleteSchemaOption,
  db: TNullableDatabase,
) {
  const dbPath = (await isDirectory(option.output))
    ? path.join(option.output, dbFileName)
    : option.output;

  await fs.promises.writeFile(dbPath, fastSafeStringify(db, undefined, 2));

  return db.pass;
}
