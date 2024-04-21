import { RefsRepository } from '#/databases/repository/refs/RefsRepository';
import { SchemaRepository } from '#/databases/repository/schemas/SchemaRepository';
import { container } from '#/modules/containers/container';
import {
  REPOSITORY_REFS_SYMBOL_KEY,
  REPOSITORY_SCHEMAS_SYMBOL_KEY,
} from '#/modules/containers/keys';
import { asValue } from 'awilix';

export function makeRepository() {
  const refs = new RefsRepository();
  const schemas = new SchemaRepository();

  container.register(REPOSITORY_REFS_SYMBOL_KEY, asValue(refs));
  container.register(REPOSITORY_SCHEMAS_SYMBOL_KEY, asValue(schemas));
}
