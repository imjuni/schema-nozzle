import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import openDatabase from '@databases/openDatabase';
import saveDatabase from '@databases/saveDatabase';
import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import { TDatabase } from '@modules/interfaces/TDatabase';

export default async function saveScheams(option: IAddSchemaOption, ...records: IDatabaseRecord[]) {
  const db = await openDatabase(option);

  const newDb: TDatabase = records.reduce((aggregation, record) => {
    return { ...aggregation, [record.id]: record };
  }, db);

  await saveDatabase(option, newDb);
}
