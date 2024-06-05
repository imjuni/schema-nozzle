import { RefsRepository } from '#/databases/repository/refs/RefsRepository';
import { SchemaRepository } from '#/databases/repository/schemas/SchemaRepository';
import { container } from '#/modules/containers/container';
import {
  $YMBOL_KEY_REPOSITORY_REFS,
  $YMBOL_KEY_REPOSITORY_SCHEMAS,
} from '#/modules/containers/keys';
import { asValue } from 'awilix';

export function makeRepository() {
  const refs = new RefsRepository();
  const schemas = new SchemaRepository();

  container.register($YMBOL_KEY_REPOSITORY_REFS, asValue(refs));
  container.register($YMBOL_KEY_REPOSITORY_SCHEMAS, asValue(schemas));
}
