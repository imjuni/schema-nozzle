import type { RefsRepository } from '#/databases/repository/refs/RefsRepository';
import type { SchemaRepository } from '#/databases/repository/schemas/SchemaRepository';
import { container } from '#/modules/containers/container';
import {
  REPOSITORY_REFS_SYMBOL_KEY,
  REPOSITORY_SCHEMAS_SYMBOL_KEY,
} from '#/modules/containers/keys';

export async function deleteRecord(typeName: string) {
  const schemaRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
  const refsRepo = container.resolve<RefsRepository>(REPOSITORY_REFS_SYMBOL_KEY);

  const record = await schemaRepo.select(typeName);

  if (record == null) {
    return [];
  }

  const refs = await refsRepo.selects([typeName]);
  const needUpdateSchemaId = refs.map((ref) => ref.refId);

  await schemaRepo.deletes([record.id]);
  await refsRepo.deletes(refs.map((ref) => ref.id));

  return needUpdateSchemaId;
}
