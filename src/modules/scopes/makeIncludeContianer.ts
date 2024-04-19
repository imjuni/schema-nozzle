import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import { container } from '#/modules/containers/container';
import { INCLUDE_CONTAINER_SYMBOL_KEY } from '#/modules/containers/keys';
import { getIncludePatterns } from '#/modules/files/getIncludePatterns';
import { IncludeContainer } from '#/modules/scopes/IncludeContainer';
import { defaultExclude } from '#/modules/scopes/defaultExclude';
import { asValue } from 'awilix';
import type { getTypeScriptConfig } from 'ts-morph-short';

export function makeIncludeContianer(
  options: Pick<TAddSchemaOption | TRefreshSchemaOption, 'include' | 'project' | 'projectDir'>,
  tsconfig: ReturnType<typeof getTypeScriptConfig>,
) {
  const includeContainer = new IncludeContainer({
    patterns: getIncludePatterns(options, tsconfig, options.project),
    options: { absolute: true, ignore: defaultExclude, cwd: options.projectDir },
  });

  container.register(INCLUDE_CONTAINER_SYMBOL_KEY, asValue(includeContainer));

  return includeContainer;
}
