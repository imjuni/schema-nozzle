import { CE_ALASQL_TABLE_NAME } from '#/databases/const-enum/CE_ALASQL_TABLE_NAME';
import type { ISchemaRecord } from '#/databases/interfaces/ISchemaRecord';
import alasql from 'alasql';
import { atOrThrow } from 'my-easy-fp';

export class SchemaRepository {
  async select(id: string): Promise<ISchemaRecord | undefined> {
    const refs = (await alasql.promise(
      `SELECT * FROM [${CE_ALASQL_TABLE_NAME.SCHEMA}] WHERE id = ?`,
      [id],
    )) as ISchemaRecord[];

    return refs.at(0);
  }

  async selectOrThrow(id: string): Promise<ISchemaRecord> {
    const refs = (await alasql.promise(
      `SELECT * FROM [${CE_ALASQL_TABLE_NAME.SCHEMA}] WHERE id = ?`,
      [id],
    )) as ISchemaRecord[];

    return atOrThrow(refs, 0, new Error(`Cannot found record ${id}`));
  }

  async selects(ids: string[]): Promise<ISchemaRecord[]> {
    const refs = (await alasql.promise(
      `SELECT * FROM [${CE_ALASQL_TABLE_NAME.SCHEMA}] WHERE id IN @(?)`,
      [ids],
    )) as ISchemaRecord[];

    return refs;
  }

  async deletes(ids: string[]): Promise<void> {
    await alasql.promise(`DELETE FROM [${CE_ALASQL_TABLE_NAME.SCHEMA}] WHERE id IN @(?)`, [ids]);
  }

  async update(schema: ISchemaRecord): Promise<ISchemaRecord> {
    await alasql.promise(
      `UPDATE [${CE_ALASQL_TABLE_NAME.SCHEMA}] SET [schema] = ?, [typeName] = ?, [filePath] = ? WHERE id = ?`,
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

    return this.update(schema);
  }
}
