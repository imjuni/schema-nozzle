import type IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import type { TDatabase } from '@modules/interfaces/TDatabase';
import fastCopy from 'fast-copy';
import { settify } from 'my-easy-fp';

export default function mergeSchemaRecords(db: TDatabase, records: IDatabaseRecord[]): TDatabase {
  const newDb = records.reduce((aggregation, record) => {
    try {
      if (aggregation[record.id] == null) {
        return { ...aggregation, [record.id]: record };
      }

      const prevRecord = aggregation[record.id];
      const nextRecord = fastCopy(record);

      nextRecord.import = {
        name: record.import.name,
        from: settify([...prevRecord.import.from, ...nextRecord.import.from]),
      };

      nextRecord.export = {
        name: record.export.name,
        to: settify([...prevRecord.export.to, ...nextRecord.export.to]),
      };

      return { ...aggregation, [nextRecord.id]: nextRecord };
    } catch {
      return aggregation;
    }
  }, fastCopy(db));

  return newDb;
}
