import { CE_ALASQL_TABLE_NAME } from '#/databases/const-enum/CE_ALASQL_TABLE_NAME';
import type { AnySchemaObject } from 'ajv';
import alasql from 'alasql';

export function getDatabaseBuf(store: Record<string, AnySchemaObject>) {
  const buf = Buffer.from(
    JSON.stringify(
      {
        $store: store,
        [CE_ALASQL_TABLE_NAME.SCHEMA]: alasql.tables[CE_ALASQL_TABLE_NAME.SCHEMA]?.data ?? {},
        [CE_ALASQL_TABLE_NAME.REF]: alasql.tables[CE_ALASQL_TABLE_NAME.REF]?.data ?? {},
      },
      undefined,
      2,
    ),
  );

  return buf;
}
