import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import { container as lokidb } from '#/databases/files/LokiDbContainer';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';

export function find(query: LokiQuery<IDatabaseItem & LokiObj>): IDatabaseItem[] {
  const container = lokidb();
  const collection = container.loki.getCollection<IDatabaseItem>(
    CE_DEFAULT_VALUE.DB_COLLECTION_NAME,
  );
  const items = collection.find(query);

  if (items == null) {
    return [];
  }

  return items;
}
