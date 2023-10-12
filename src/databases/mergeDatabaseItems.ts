import type IDatabaseItem from '#/modules/interfaces/IDatabaseItem';
import type { TDatabase, TNullableDatabase } from '#/modules/interfaces/TDatabase';
import deepmerge, { type ArrayMergeOptions } from 'deepmerge';
import fastCopy from 'fast-copy';
import { isPlainObject } from 'is-plain-object';
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

      const merged = deepmerge(prevRecord, nextRecord, {
        isMergeableObject: isPlainObject,
        arrayMerge: (
          target: IDatabaseItem[],
          source: IDatabaseItem[],
          options: ArrayMergeOptions,
        ) => {
          const destination = target.slice();

          source.forEach((item, index) => {
            if (destination[index] == null) {
              destination[index] = options.cloneUnlessOtherwiseSpecified(
                item,
                options,
              ) as IDatabaseItem;
            } else if (options.isMergeableObject(item)) {
              destination[index] = deepmerge(target[index] ?? {}, item, options) as IDatabaseItem;
            } else if (target.includes(item)) {
              destination.push(item);
            }
          });

          return settify(destination);
        },
      });

      merged.dependency.import = importInfo;
      merged.dependency.export = exportInfo;

      return { ...aggregation, [nextRecord.id]: merged };
    } catch {
      return aggregation;
    }
  }, fastCopy(db));

  return newDb as TDatabase;
}
