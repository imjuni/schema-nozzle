import { CE_ALASQL_TABLE_NAME } from '#/databases/const-enum/CE_ALASQL_TABLE_NAME';
import type { ISchemaRefRecord } from '#/databases/interfaces/ISchemaRefRecord';
import alasql from 'alasql';
import { atOrThrow } from 'my-easy-fp';

export class RefsRepository {
  async select(id: string): Promise<ISchemaRefRecord | undefined> {
    const refs = (await alasql.promise(
      `SELECT * FROM [${CE_ALASQL_TABLE_NAME.REF}] WHERE [id] = ?`,
      [id],
    )) as ISchemaRefRecord[];

    return refs.at(0);
  }

  async selectOrThrow(id: string): Promise<ISchemaRefRecord> {
    const refs = (await alasql.promise(
      `SELECT * FROM [${CE_ALASQL_TABLE_NAME.REF}] WHERE [id] = ?`,
      [id],
    )) as ISchemaRefRecord[];

    return atOrThrow(refs, 0, new Error(`Cannot found record ${id}`));
  }

  async selects(ids: string[]): Promise<ISchemaRefRecord[]> {
    const refs = (await alasql.promise(
      `SELECT * FROM [${CE_ALASQL_TABLE_NAME.REF}] WHERE id IN @(?)`,
      [ids],
    )) as ISchemaRefRecord[];

    return refs;
  }

  async deletes(ids: string[]): Promise<void> {
    await alasql.promise(`DELETE FROM [${CE_ALASQL_TABLE_NAME.REF}] WHERE [id] IN @(?)`, [ids]);
  }

  async update(ref: ISchemaRefRecord): Promise<ISchemaRefRecord> {
    await alasql.promise(
      `UPDATE [${CE_ALASQL_TABLE_NAME.REF}] SET [id] = ?, [refId] = ? WHERE [id] = ?`,
      [ref.id, ref.refId, ref.id],
    );
    const updated = await this.selectOrThrow(ref.id);
    return updated;
  }

  async insert(ref: ISchemaRefRecord): Promise<ISchemaRefRecord> {
    await alasql.promise(
      `INSERT INTO [${CE_ALASQL_TABLE_NAME.REF}] ([id], [id], [refId]) VALUES (?, ?, ?)`,
      [ref.id, ref.id, ref.refId],
    );
    const inserted = await this.selectOrThrow(ref.id);
    return inserted;
  }

  async upsert(ref: ISchemaRefRecord): Promise<ISchemaRefRecord> {
    const prev = await this.select(ref.id);

    if (prev == null) {
      return this.insert(ref);
    }

    await this.deletes([ref.id]);
    await this.insert(ref);
    return this.selectOrThrow(ref.id);
  }
}
