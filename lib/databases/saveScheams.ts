import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import ITruncateSchemaOption from '@configs/interfaces/ITruncateSchemaOption';
import saveDatabase from '@databases/saveDatabase';
import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import { TDatabase } from '@modules/interfaces/TDatabase';
import fastCopy from 'fast-copy';

export default async function saveScheams<
  T extends IAddSchemaOption | IDeleteSchemaOption | ITruncateSchemaOption | IRefreshSchemaOption,
>(option: T, db: TDatabase, ...records: IDatabaseRecord[]) {
  const newDb: TDatabase = records.reduce((aggregation, record) => {
    return { ...aggregation, [record.id]: fastCopy(record) };
  }, db);

  const dtoRecords = Object.values(newDb).filter((record) => record.dto);

  const processedDtoRecords = dtoRecords
    .map((record) => record.import.from)
    .flat()
    .map((importFrom) => newDb[importFrom])
    .map((importRecord) => ({ ...importRecord, dto: true }));

  processedDtoRecords.forEach((record) => {
    newDb[record.id].dto = true;
  });

  await saveDatabase(option, newDb);
}
