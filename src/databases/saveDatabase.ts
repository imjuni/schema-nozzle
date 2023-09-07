import fastSafeStringify from 'fast-safe-stringify';
import fs from 'fs';
import type TAddSchemaOption from 'src/configs/interfaces/TAddSchemaOption';
import type TDeleteSchemaOption from 'src/configs/interfaces/TDeleteSchemaOption';
import type TRefreshSchemaOption from 'src/configs/interfaces/TRefreshSchemaOption';
import type TTruncateSchemaOption from 'src/configs/interfaces/TTruncateSchemaOption';
import type TWatchSchemaOption from 'src/configs/interfaces/TWatchSchemaOption';
import getDatabaseFilePath from 'src/databases/getDatabaseFilePath';
import type { TDatabase } from 'src/modules/interfaces/TDatabase';
import logger from 'src/tools/logger';

const log = logger();

export default async function saveDatabase(
  option:
    | TAddSchemaOption
    | TDeleteSchemaOption
    | TTruncateSchemaOption
    | TRefreshSchemaOption
    | TWatchSchemaOption,
  db: TDatabase,
) {
  const dbPath = await getDatabaseFilePath(option);

  log.trace(`SaveDatabase: ${dbPath}`);

  const sortedDb = Object.values(db)
    .sort((l, r) => l.id.localeCompare(r.id))
    .reduce((aggregation, record) => {
      return { ...aggregation, [record.id]: record };
    }, {});

  await fs.promises.writeFile(dbPath, fastSafeStringify(sortedDb, undefined, 2));

  return db;
}
