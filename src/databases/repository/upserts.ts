/* eslint-disable no-await-in-loop */
import type { GeneratedContainer } from '#/databases/repository/GeneratedContainer';
import type { RefsRepository } from '#/databases/repository/refs/RefsRepository';
import type { SchemaRepository } from '#/databases/repository/schemas/SchemaRepository';
import { container } from '#/modules/containers/container';
import {
  REPOSITORY_REFS_SYMBOL_KEY,
  REPOSITORY_SCHEMAS_SYMBOL_KEY,
} from '#/modules/containers/keys';

export async function upserts(generated: GeneratedContainer) {
  const schemaRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);

  for (let i = 0; i < generated.records.length; i += 1) {
    const record = generated.records.at(i);

    if (record != null) {
      await schemaRepo.upsert(record);
    }
  }

  const refRepo = container.resolve<RefsRepository>(REPOSITORY_REFS_SYMBOL_KEY);

  for (let i = 0; i < generated.refs.length; i += 1) {
    const ref = generated.refs.at(i);

    if (ref != null) {
      await refRepo.upsert(ref);
    }
  }
}
