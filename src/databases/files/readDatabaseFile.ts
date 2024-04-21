import type { ISchemaRecord } from '#/databases/interfaces/ISchemaRecord';
import type { ISchemaRefRecord } from '#/databases/interfaces/ISchemaRefRecord';
import fs from 'node:fs';

export async function readDatabaseFile(filePath: string): Promise<{
  schemas: ISchemaRecord[];
  references: ISchemaRefRecord[];
}> {
  const buf = await fs.promises.readFile(filePath);
  const db = JSON.parse(buf.toString()) as {
    schemas: ISchemaRecord[];
    references: ISchemaRefRecord[];
  };

  return db;
}
