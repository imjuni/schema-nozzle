import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import ITruncateSchemaOption from '@configs/interfaces/ITruncateSchemaOption';
import saveDatabase from '@databases/saveDatabase';
import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import { TDatabase } from '@modules/interfaces/TDatabase';

export default async function saveScheams<
  T extends IAddSchemaOption | IDeleteSchemaOption | ITruncateSchemaOption | IRefreshSchemaOption,
>(option: T, db: TDatabase, ...records: IDatabaseRecord[]) {
  const newDb: TDatabase = records.reduce((aggregation, record) => {
    return { ...aggregation, [record.id]: record };
  }, db);

  await saveDatabase(option, newDb);
}
