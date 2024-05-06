import { CE_ALASQL_TABLE_NAME } from '#/databases/const-enum/CE_ALASQL_TABLE_NAME';
import { readDatabaseFile } from '#/databases/files/readDatabaseFile';
import { container } from '#/modules/containers/container';
import {
  SCHEMA_DATABASE_SYMBOL_KEY,
  SCHEMA_ORIGIN_DATABASE_SYMBOL_KEY,
} from '#/modules/containers/keys';
import alasql from 'alasql';
import { asValue } from 'awilix';

export async function makeSQLDatabase(filePath: string) {
  const data = await readDatabaseFile(filePath);

  // CREATE TABLE tab0(pk INTEGER NOT NULL PRIMARY KEY, col0 INTEGER, col1 FLOAT, col2 TEXT, col3 INTEGER, col4 FLOAT, col5 TEXT);
  // INSERT INTO tab0 VALUES(0,6,4.67,'wdbsg',4,2.89,'altmp');
  alasql(
    `CREATE TABLE 
       IF NOT EXISTS [${CE_ALASQL_TABLE_NAME.SCHEMA}] 
       (
         [id] STRING,
         [schema] JSON,
         [typeName] STRING,
         [filePath] STRING NULL
       )`,
  );
  alasql(
    `CREATE TABLE 
       IF NOT EXISTS [${CE_ALASQL_TABLE_NAME.REF}] 
       (
         [pk] STRING,
         [id] STRING,
         [refId] STRING
       )`,
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  alasql.tables[CE_ALASQL_TABLE_NAME.SCHEMA]!.data = data[CE_ALASQL_TABLE_NAME.SCHEMA];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  alasql.tables[CE_ALASQL_TABLE_NAME.REF]!.data = data[CE_ALASQL_TABLE_NAME.REF];

  // 원본 데이터는 복제되어 테이블에 보관되는 것을 보인다, 그래서 삭제 테스트 후 둘을 비교하면 다른 결과가 나온다
  // alasql create clone data from origin because I did delete query after compare two data sets that is different
  container.register(SCHEMA_DATABASE_SYMBOL_KEY, asValue(alasql.tables));
  container.register(SCHEMA_ORIGIN_DATABASE_SYMBOL_KEY, asValue(data));

  return data;
}
