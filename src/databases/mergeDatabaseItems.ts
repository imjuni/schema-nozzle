import type IDatabaseItem from '#modules/interfaces/IDatabaseItem';
import type { TDatabase, TNullableDatabase } from '#modules/interfaces/TDatabase';
import deepmerge from 'deepmerge';
import fastCopy from 'fast-copy';
import { settify } from 'my-easy-fp';

export default function mergeDatabaseItems(
  db: TNullableDatabase,
  records: IDatabaseItem[],
): TDatabase {
  const newDb = records.reduce<TNullableDatabase>((aggregation, record) => {
    try {
      const prevRecord = aggregation[record.id];

      if (prevRecord == null) {
        return { ...aggregation, [record.id]: record };
      }

      const nextRecord = fastCopy(record);

      // nextRecord.dependency.import = {
      const importInfo = {
        name: record.dependency.import.name,
        from: settify([...prevRecord.dependency.import.from, ...nextRecord.dependency.import.from]),
      };

      // nextRecord.dependency.export = {
      const exportInfo = {
        name: record.dependency.export.name,
        to: settify([...prevRecord.dependency.export.to, ...nextRecord.dependency.export.to]),
      };

      const merged = deepmerge(prevRecord, nextRecord);
      merged.dependency.import = importInfo;
      merged.dependency.export = exportInfo;

      return { ...aggregation, [nextRecord.id]: merged };
    } catch {
      return aggregation;
    }
  }, fastCopy(db));

  return newDb as TDatabase;
}
