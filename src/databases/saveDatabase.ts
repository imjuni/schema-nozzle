import type TAddSchemaOption from '#/configs/interfaces/TAddSchemaOption';
import type TDeleteSchemaOption from '#/configs/interfaces/TDeleteSchemaOption';
import type TRefreshSchemaOption from '#/configs/interfaces/TRefreshSchemaOption';
import type TTruncateSchemaOption from '#/configs/interfaces/TTruncateSchemaOption';
import type TWatchSchemaOption from '#/configs/interfaces/TWatchSchemaOption';
import getDatabaseFilePath from '#/databases/getDatabaseFilePath';
import type { TDatabase } from '#/modules/interfaces/TDatabase';
import logger from '#/tools/logger';
import fastSafeStringify from 'fast-safe-stringify';
import fs from 'fs';

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
