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

  async selectWithRefId(id: string, refId: string): Promise<ISchemaRefRecord | undefined> {
    const refs = (await alasql.promise(
      `SELECT * FROM [${CE_ALASQL_TABLE_NAME.REF}] WHERE [id] = ? and [refId] = ?`,
      [id, refId],
    )) as ISchemaRefRecord[];

    return refs.at(0);
  }

  async selectWithRefIdOrThrow(id: string, refId: string): Promise<ISchemaRefRecord> {
    const refs = (await alasql.promise(
      `SELECT * FROM [${CE_ALASQL_TABLE_NAME.REF}] WHERE [id] = ? and [refId] = ?`,
      [id, refId],
    )) as ISchemaRefRecord[];

    return atOrThrow(refs, 0, new Error(`Cannot found record ${id} >> ${refId}`));
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

  async deleteWithRefId(id: string, refId: string): Promise<void> {
    await alasql.promise(
      `DELETE FROM [${CE_ALASQL_TABLE_NAME.REF}] WHERE [id] = ? and [refId] = ?`,
      [id, refId],
    );
  }

  async insert(ref: ISchemaRefRecord): Promise<ISchemaRefRecord> {
    await alasql.promise(
      `INSERT INTO [${CE_ALASQL_TABLE_NAME.REF}] ([id], [refId]) VALUES (?, ?)`,
      [ref.id, ref.refId],
    );
    const inserted = await this.selectOrThrow(ref.id);
    return inserted;
  }

  async upsert(ref: ISchemaRefRecord): Promise<ISchemaRefRecord> {
    const prev = await this.selectWithRefId(ref.id, ref.refId);

    if (prev == null) {
      return this.insert(ref);
    }

    await this.deleteWithRefId(ref.id, ref.refId);
    await this.insert(ref);
    return this.selectWithRefIdOrThrow(ref.id, ref.refId);
  }
}
