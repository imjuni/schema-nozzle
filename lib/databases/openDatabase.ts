import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import dbFileName from '@databases/interfaces/dbFileName';
import { TDatabase } from '@modules/interfaces/TDatabase';
import safeParse from '@tools/safeParse';
import fs from 'fs';
import { exists, isDirectory } from 'my-node-fp';
import path from 'path';

export default async function openDatabase(option: IAddSchemaOption | IDeleteSchemaOption) {
  const dbPath = (await isDirectory(option.output))
    ? path.join(option.output, dbFileName)
    : option.output;

  const rawDb = (await exists(dbPath)) ? (await fs.promises.readFile(dbPath)).toString() : '{}';

  const db = safeParse<TDatabase>(rawDb);

  if (db.type === 'fail') throw db.fail;

  return db.pass;
}
