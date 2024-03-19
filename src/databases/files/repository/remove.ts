import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import { getIt as lokidb } from '#/databases/files/LokiDbContainer';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import { toArray } from 'my-easy-fp';

export function remove(ids: string | string[]) {
  const container = lokidb();
  const collection = container.loki.getCollection<IDatabaseItem>(
    CE_DEFAULT_VALUE.DB_COLLECTION_NAME,
  );
  const items = collection.find({ id: { $in: toArray(ids) } });
  collection.remove(items);
}
