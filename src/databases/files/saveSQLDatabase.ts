import { CE_ALASQL_TABLE_NAME } from '#/databases/const-enum/CE_ALASQL_TABLE_NAME';
import type { ISchemaRecord } from '#/databases/interfaces/ISchemaRecord';
import type { ISchemaRefRecord } from '#/databases/interfaces/ISchemaRefRecord';
import { container } from '#/modules/containers/container';
import { SCHEMA_DATABASE_SYMBOL_KEY } from '#/modules/containers/keys';

export function getSQLDatabaseBuf() {
  const tables = container.resolve<{
    schemas: { data: ISchemaRecord[] };
    refs: { data: ISchemaRefRecord[] };
  }>(SCHEMA_DATABASE_SYMBOL_KEY);

  const buf = Buffer.from(
    JSON.stringify(
      {
        [CE_ALASQL_TABLE_NAME.SCHEMA]: tables[CE_ALASQL_TABLE_NAME.SCHEMA].data ?? {},
        [CE_ALASQL_TABLE_NAME.REF]: tables[CE_ALASQL_TABLE_NAME.REF].data ?? {},
      },
      undefined,
      2,
    ),
  );

  return buf;
}
