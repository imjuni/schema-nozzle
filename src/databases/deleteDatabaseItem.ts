import { findOne } from '#/databases/files/repository/findOne';
import { remove } from '#/databases/files/repository/remove';

export function deleteDatabaseItem(identifier: string) {
  const item = findOne({ id: { $eq: identifier } });

  if (item == null) {
    return;
  }

  remove(item.id);
}
