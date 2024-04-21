import { findOne } from '#/databases/files/repository_bak/findOne';
import { insert } from '#/databases/files/repository_bak/insert';
import { update } from '#/databases/files/repository_bak/update';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import deepmerge, { type ArrayMergeOptions } from 'deepmerge';
import fastCopy from 'fast-copy';
import { isPlainObject } from 'is-plain-object';
import { settify } from 'my-easy-fp';

export function mergeOne(item: IDatabaseItem) {
  const prevItem = findOne({ id: { $eq: item.id } });

  if (prevItem == null) {
    insert(item);
  } else {
    const nextItem = fastCopy(item);

    const merged = deepmerge(prevItem, nextItem, {
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

    update(merged);
  }
}
