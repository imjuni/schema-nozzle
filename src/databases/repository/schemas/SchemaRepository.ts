import { CE_ALASQL_TABLE_NAME } from '#/databases/const-enum/CE_ALASQL_TABLE_NAME';
import type { ISchemaRecord } from '#/databases/interfaces/ISchemaRecord';
import alasql from 'alasql';
import { atOrThrow } from 'my-easy-fp';

export class SchemaRepository {
  async select(id: string): Promise<ISchemaRecord | undefined> {
    const schemas = (await alasql.promise(
      `SELECT * FROM [${CE_ALASQL_TABLE_NAME.SCHEMA}] WHERE [id] = ?`,
      [id],
    )) as ISchemaRecord[];

    return schemas.at(0);
  }

  async selectOrThrow(id: string): Promise<ISchemaRecord> {
    const schemas = (await alasql.promise(
      `SELECT * FROM [${CE_ALASQL_TABLE_NAME.SCHEMA}] WHERE [id] = ?`,
      [id],
    )) as ISchemaRecord[];

    return atOrThrow(schemas, 0, new Error(`Cannot found record ${id}`));
  }

  async selects(ids: string[]): Promise<ISchemaRecord[]> {
    const schemas = (await alasql.promise(
      `SELECT * FROM [${CE_ALASQL_TABLE_NAME.SCHEMA}] WHERE id IN @(?)`,
      [ids],
    )) as ISchemaRecord[];

    return schemas;
  }

  async deletes(ids: string[]): Promise<void> {
    await alasql.promise(`DELETE FROM [${CE_ALASQL_TABLE_NAME.SCHEMA}] WHERE [id] IN @(?)`, [ids]);
  }

  async update(schema: ISchemaRecord): Promise<ISchemaRecord> {
    await alasql.promise(
      `UPDATE [${CE_ALASQL_TABLE_NAME.SCHEMA}] SET [schema] = ?, [typeName] = ?, [filePath] = ? WHERE [id] = ?`,
      [schema.schema, schema.typeName, schema.filePath, schema.id],
    );
    return this.selectOrThrow(schema.id);
  }

  async insert(schema: ISchemaRecord): Promise<ISchemaRecord> {
    await alasql.promise(
      `INSERT INTO [${CE_ALASQL_TABLE_NAME.SCHEMA}] ([id], [schema], [typeName], [filePath]) VALUES (?, ?, ?, ?)`,
      [schema.id, schema.schema, schema.typeName, schema.filePath],
    );
    const inserted = await this.selectOrThrow(schema.id);
    return inserted;
  }

  async upsert(schema: ISchemaRecord): Promise<ISchemaRecord> {
    const prev = await this.select(schema.id);

    if (prev == null) {
      return this.insert(schema);
    }

    // alasql has problem in PRIMARY KEY, So, we need to delete and insert
    // @see https://github.com/AlaSQL/alasql/issues/1005
    await this.deletes([schema.id]);
    await this.insert(schema);
    return this.selectOrThrow(schema.id);
  }

  async types(): Promise<Pick<ISchemaRecord, 'id' | 'filePath'>[]> {
    const schemas = (await alasql.promise(
      `SELECT [id], [filePath] FROM [${CE_ALASQL_TABLE_NAME.SCHEMA}]`,
    )) as Pick<ISchemaRecord, 'id' | 'filePath'>[];

    return schemas;
  }
}
