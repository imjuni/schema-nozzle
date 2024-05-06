import { CE_ALASQL_TABLE_NAME } from '#/databases/const-enum/CE_ALASQL_TABLE_NAME';
import type { ISchemaRecord } from '#/databases/interfaces/ISchemaRecord';
import type { ISchemaRefRecord } from '#/databases/interfaces/ISchemaRefRecord';
import { isFalse } from 'my-easy-fp';
import { exists } from 'my-node-fp';
import fs from 'node:fs';

export async function readDatabaseFile(filePath: string): Promise<{
  [CE_ALASQL_TABLE_NAME.SCHEMA]: ISchemaRecord[];
  [CE_ALASQL_TABLE_NAME.REF]: ISchemaRefRecord[];
}> {
  if (isFalse(await exists(filePath))) {
    return {
      [CE_ALASQL_TABLE_NAME.SCHEMA]: [],
      [CE_ALASQL_TABLE_NAME.REF]: [],
    };
  }

  const buf = await fs.promises.readFile(filePath);
  const db = JSON.parse(buf.toString()) as {
    [CE_ALASQL_TABLE_NAME.SCHEMA]: ISchemaRecord[];
    [CE_ALASQL_TABLE_NAME.REF]: ISchemaRefRecord[];
  };

  return db;
}
