import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { TWatchSchemaOption } from '#/configs/interfaces/TWatchSchemaOption';
import type { SetRequired } from 'type-fest';

export function isRelativeDtoPath(
  option:
    | Pick<TAddSchemaOption, 'rootDir'>
    | Pick<TRefreshSchemaOption, 'rootDir'>
    | Pick<TWatchSchemaOption, 'rootDir'>,
): option is SetRequired<typeof option, 'rootDir'> {
  return option.rootDir != null;
}
