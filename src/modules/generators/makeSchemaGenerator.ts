import { container } from '#/modules/containers/container';
import { SCHEMA_GENERATOR_SYMBOL_KEY } from '#/modules/containers/keys';
import { asValue } from 'awilix';
import { createGenerator, type Config } from 'ts-json-schema-generator';

/**
 * path, type을 지정하지 않을 때 project를 절대 경로로 전달하지 않으면 generator를
 * 생성할 때 오류가 발생한다. root type을 찾을 수 없다고 하면서 스키마가 생성되지 않는다.
 *
 * 그 때 스키마를 생성할 때마다 generator를 생성한다면 성능이 매우 떨어지기 때문에 주의한다.
 */
export function makeSchemaGenerator(project: string, options: Config) {
  const generator = createGenerator({
    ...options,
    tsconfig: project,
  });

  container.register(SCHEMA_GENERATOR_SYMBOL_KEY, asValue(generator));
}
