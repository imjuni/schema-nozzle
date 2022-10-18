import IDatabaseOption from '@configs/interfaces/IDatabaseOption';
import dbFileName from '@databases/interfaces/dbFileName';
import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import safeParse from '@tools/safeParse';
import fs from 'fs';
import { exists, isDirectory } from 'my-node-fp';
import path from 'path';

export default async function openDatabase(option: IDatabaseOption) {
  const dbPath = (await isDirectory(option.output))
    ? path.join(option.output, dbFileName)
    : option.output;

  const rawDb = (await exists(dbPath)) ? (await fs.promises.readFile(dbPath)).toString() : '{}';

  const db = safeParse<Record<string, IDatabaseRecord>>(rawDb);

  if (db.type === 'fail') throw db.fail;

  return db.pass;
}
