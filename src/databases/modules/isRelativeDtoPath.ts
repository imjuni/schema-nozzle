import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { SetRequired } from 'type-fest';

export function isRelativeDtoPath(
  option:
    | Pick<TAddSchemaOption, 'rootDirs'>
    | Pick<TRefreshSchemaOption, 'rootDirs'>
    | Pick<TDeleteSchemaOption, 'rootDirs'>,
): option is SetRequired<typeof option, 'rootDirs'> {
  return option.rootDirs != null;
}
