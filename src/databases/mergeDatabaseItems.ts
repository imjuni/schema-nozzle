import { mergeDatabaseItem } from '#/databases/mergeDatabaseItem';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';

export function mergeDatabaseItems(items: IDatabaseItem[]) {
  items.forEach((item) => mergeDatabaseItem(item));
}
