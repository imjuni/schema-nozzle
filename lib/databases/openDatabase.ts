import IResolvedPaths from '@configs/interfaces/IResolvedPaths';
import dbFileName from '@databases/interfaces/dbFileName';
import { TDatabase } from '@modules/interfaces/TDatabase';
import safeParse from '@tools/safeParse';
import fs from 'fs';
import { exists, isDirectory } from 'my-node-fp';
import path from 'path';

export default async function openDatabase(resolvedPaths: IResolvedPaths) {
  const dbPath = (await isDirectory(resolvedPaths.output))
    ? path.join(resolvedPaths.output, dbFileName)
    : resolvedPaths.output;

  const rawDb = (await exists(dbPath)) ? (await fs.promises.readFile(dbPath)).toString() : '{}';

  const db = safeParse<TDatabase>(rawDb);

  if (db.type === 'fail') throw db.fail;

  return db.pass;
}
