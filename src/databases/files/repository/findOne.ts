import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import { getIt as lokidb } from '#/databases/files/LokiDbContainer';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';

export function findOne(query: LokiQuery<IDatabaseItem & LokiObj>): IDatabaseItem | undefined {
  const container = lokidb();
  const collection = container.loki.getCollection<IDatabaseItem>(
    CE_DEFAULT_VALUE.DB_COLLECTION_NAME,
  );
  const item = collection.findOne(query);

  if (item == null) {
    return undefined;
  }

  return item;
}
