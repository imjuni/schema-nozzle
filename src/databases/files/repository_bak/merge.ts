import { mergeOne } from '#/databases/files/repository_bak/mergeOne';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import { toArray } from 'my-easy-fp';

export function merge(items: IDatabaseItem | IDatabaseItem[]) {
  const targetItems = toArray(items);
  targetItems.forEach((item) => mergeOne(item));
}
