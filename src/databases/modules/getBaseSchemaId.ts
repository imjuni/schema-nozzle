import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { TWatchSchemaOption } from '#/configs/interfaces/TWatchSchemaOption';
import { getDtoName } from '#/databases/modules/getDtoName';
import { isRelativeDtoPath } from '#/databases/modules/isRelativeDtoPath';
import { replaceId } from '#/databases/modules/replaceId';
import path from 'node:path';

export function getBaseSchemaId(
  schemaId: string,
  filePath: string,
  option:
    | Pick<TAddSchemaOption, 'rootDir'>
    | Pick<TRefreshSchemaOption, 'rootDir'>
    | Pick<TWatchSchemaOption, 'rootDir'>,
) {
  if (isRelativeDtoPath(option)) {
    const dtoName = replaceId(schemaId);
    const relativePath = path.relative(option.rootDir, path.dirname(filePath)).replace('./', '');

    return getDtoName(
      dtoName,
      (name) => `#/${[relativePath, name].filter((element) => element !== '').join('/')}`,
    );
  }

  const dtoName = replaceId(schemaId);
  return dtoName;
}
