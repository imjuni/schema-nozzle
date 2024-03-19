import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import { isRelativeDtoPath } from '#/databases/modules/isRelativeDtoPath';

export function getFastifySwaggerId(
  id: string,
  option:
    | Pick<TAddSchemaOption, 'rootDirs'>
    | Pick<TRefreshSchemaOption, 'rootDirs'>
    | Pick<TDeleteSchemaOption, 'rootDirs'>,
) {
  if (isRelativeDtoPath(option)) {
    return id.replace(/\//g, '-').replace(/^#/, '');
  }

  return id.replace(/\//g, '-');
}
