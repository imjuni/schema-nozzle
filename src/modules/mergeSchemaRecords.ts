import type IDatabaseRecord from '#modules/interfaces/IDatabaseRecord';
import type { TDatabase, TNullableDatabase } from '#modules/interfaces/TDatabase';
import fastCopy from 'fast-copy';
import { settify } from 'my-easy-fp';

export default function mergeSchemaRecords(
  db: TNullableDatabase,
  records: IDatabaseRecord[],
): TDatabase {
  const newDb = records.reduce<TNullableDatabase>((aggregation, record) => {
    try {
      const prevRecord = aggregation[record.id];

      if (prevRecord == null) {
        return { ...aggregation, [record.id]: record };
      }

      const nextRecord = fastCopy(record);

      nextRecord.dependency.import = {
        name: record.dependency.import.name,
        from: settify([...prevRecord.dependency.import.from, ...nextRecord.dependency.import.from]),
      };

      nextRecord.dependency.export = {
        name: record.dependency.export.name,
        to: settify([...prevRecord.dependency.export.to, ...nextRecord.dependency.export.to]),
      };

      return { ...aggregation, [nextRecord.id]: nextRecord };
    } catch {
      return aggregation;
    }
  }, fastCopy(db));

  return newDb as TDatabase;
}
