import { LokiDbContainer } from '#/databases/files/LokiDb';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import deepmerge, { type ArrayMergeOptions } from 'deepmerge';
import fastCopy from 'fast-copy';
import { isPlainObject } from 'is-plain-object';
import { settify } from 'my-easy-fp';

export function mergeDatabaseItems(items: IDatabaseItem[]) {
  items.forEach((item) => {
    const prevItem = LokiDbContainer.it.find(item.id);

    if (prevItem == null) {
      LokiDbContainer.it.insert(item);
    } else {
      const nextRecord = fastCopy(item);

      // nextRecord.dependency.import = {
      const importInfo = {
        name: item.dependency.import.name,
        from: settify([...prevItem.dependency.import.from, ...nextRecord.dependency.import.from]),
      };

      // nextRecord.dependency.export = {
      const exportInfo = {
        name: item.dependency.export.name,
        to: settify([...prevItem.dependency.export.to, ...nextRecord.dependency.export.to]),
      };

      const merged = deepmerge(prevItem, nextRecord, {
        isMergeableObject: isPlainObject,
        arrayMerge: (
          target: IDatabaseItem[],
          source: IDatabaseItem[],
          options: ArrayMergeOptions,
        ) => {
          const destination = target.slice();

          source.forEach(($item, index) => {
            if (destination[index] == null) {
              destination[index] = options.cloneUnlessOtherwiseSpecified(
                $item,
                options,
              ) as IDatabaseItem;
            } else if (options.isMergeableObject($item)) {
              destination[index] = deepmerge(target[index] ?? {}, $item, options) as IDatabaseItem;
            } else if (target.includes($item)) {
              destination.push($item);
            }
          });

          return settify(destination);
        },
      });

      merged.dependency.import = importInfo;
      merged.dependency.export = exportInfo;

      LokiDbContainer.it.update(merged);
    }
  });
}
