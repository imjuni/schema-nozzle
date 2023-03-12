import deleteDatabaseItem from '#databases/deleteDatabaseItem';
import type { TDatabase } from '#modules/interfaces/TDatabase';

export default function deleteDatabaseItemsByFile(db: TDatabase, filePath: string) {
  const entries = Object.entries(db)
    .filter(([, item]) => item.filePath === filePath)
    .map(([identifier, item]) => ({ identifier, item }));

  const newDb = entries.reduce((deletingDb, entry) => {
    const nextDb = deleteDatabaseItem(deletingDb, entry.identifier);
    return nextDb;
  }, db);

  return newDb;
}
