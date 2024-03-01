import type { TAddSchemaBaseOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaBaseOption } from '#/configs/interfaces/TRefreshSchemaOption';
import { getFileScope } from '#/modules/files/getFileScope';
import type { getTypeScriptConfig } from 'ts-morph-short';

export function getTsExcludeFiles(config: {
  config: Pick<TAddSchemaBaseOption | TRefreshSchemaBaseOption, 'exclude'>;
  tsconfig: Pick<ReturnType<typeof getTypeScriptConfig>, 'raw'>;
}): string[] {
  if (config.config.exclude != null && config.config.exclude.length > 0) {
    return config.config.exclude;
  }

  const { exclude } = getFileScope(config.tsconfig.raw);
  return exclude;
}
