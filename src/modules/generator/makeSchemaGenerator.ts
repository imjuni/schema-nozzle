import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import { container } from '#/modules/containers/container';
import { SCHEMA_GENERATOR_SYMBOL_KEY } from '#/modules/containers/keys';
import { asValue } from 'awilix';
import { createGenerator } from 'ts-json-schema-generator';

export function makeSchemaGenerator(
  options:
    | Pick<TAddSchemaOption, 'project' | 'generatorOptionObject'>
    | Pick<TRefreshSchemaOption, 'project' | 'generatorOptionObject'>,
) {
  const generator = createGenerator({
    ...options.generatorOptionObject,
    tsconfig: options.project,
  });

  container.register(SCHEMA_GENERATOR_SYMBOL_KEY, asValue(generator));
}
