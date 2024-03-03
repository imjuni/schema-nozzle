import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import { getDb as lokidb } from '#/databases/files/LokiDbContainer';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';

export function insert(items: IDatabaseItem | IDatabaseItem[]) {
  const container = lokidb();
  const collection = container.loki.getCollection<IDatabaseItem>(
    CE_DEFAULT_VALUE.DB_COLLECTION_NAME,
  );
  collection.insert(items);
}
