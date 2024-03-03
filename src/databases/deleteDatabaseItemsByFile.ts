import { deleteDatabaseItem } from '#/databases/deleteDatabaseItem';
import { find } from '#/databases/files/repository/find';

export function deleteDatabaseItemsByFile(filePath: string) {
  const items = find({
    filePath: { $and: [{ filePath: { $not: null } }, { filePath: { $eq: filePath } }] },
  });

  items.forEach((item) => deleteDatabaseItem(item.id));
}
