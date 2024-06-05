import type { RefsRepository } from '#/databases/repository/refs/RefsRepository';
import type { SchemaRepository } from '#/databases/repository/schemas/SchemaRepository';
import { container } from '#/modules/containers/container';
import {
  $YMBOL_KEY_REPOSITORY_REFS,
  $YMBOL_KEY_REPOSITORY_SCHEMAS,
} from '#/modules/containers/keys';

export async function deleteRecord(typeName: string) {
  const schemaRepo = container.resolve<SchemaRepository>($YMBOL_KEY_REPOSITORY_SCHEMAS);
  const refsRepo = container.resolve<RefsRepository>($YMBOL_KEY_REPOSITORY_REFS);

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
