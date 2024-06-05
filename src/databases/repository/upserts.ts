/* eslint-disable no-await-in-loop */
import type { GeneratedContainer } from '#/databases/repository/GeneratedContainer';
import type { RefsRepository } from '#/databases/repository/refs/RefsRepository';
import type { SchemaRepository } from '#/databases/repository/schemas/SchemaRepository';
import { container } from '#/modules/containers/container';
import {
  $YMBOL_KEY_REPOSITORY_REFS,
  $YMBOL_KEY_REPOSITORY_SCHEMAS,
} from '#/modules/containers/keys';

export async function upserts(generated: GeneratedContainer) {
  const schemaRepo = container.resolve<SchemaRepository>($YMBOL_KEY_REPOSITORY_SCHEMAS);

  for (let i = 0; i < generated.records.length; i += 1) {
    const record = generated.records.at(i);

    if (record != null) {
      await schemaRepo.upsert(record);
    }
  }

  const refRepo = container.resolve<RefsRepository>($YMBOL_KEY_REPOSITORY_REFS);

  for (let i = 0; i < generated.refs.length; i += 1) {
    const ref = generated.refs.at(i);

    if (ref != null) {
      await refRepo.upsert(ref);
    }
  }
}
