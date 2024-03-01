import type { TAddSchemaBaseOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaBaseOption } from '#/configs/interfaces/TRefreshSchemaOption';
import { getFileScope } from '#/modules/files/getFileScope';
import type * as tsm from 'ts-morph';

export function getExcludePatterns(
  options: Pick<TAddSchemaBaseOption | TRefreshSchemaBaseOption, 'exclude'>,
  tsconfig: Pick<tsm.ts.ParsedCommandLine, 'raw'>,
): string[] {
  if (options.exclude != null && options.exclude.length > 0) {
    return options.exclude;
  }

  const { exclude } = getFileScope(tsconfig.raw);
  return exclude;
}
