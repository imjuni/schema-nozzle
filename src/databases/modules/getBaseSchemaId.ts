import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { TWatchSchemaOption } from '#/configs/interfaces/TWatchSchemaOption';
import { getDtoName } from '#/databases/modules/getDtoName';
import { isRelativeDtoPath } from '#/databases/modules/isRelativeDtoPath';
import { getDirnameSync } from 'my-node-fp';
import path from 'path';

export function getBaseSchemaId(
  schemaId: string,
  filePath: string,
  option:
    | Pick<TAddSchemaOption, 'rootDir' | 'includePath'>
    | Pick<TRefreshSchemaOption, 'rootDir' | 'includePath'>
    | Pick<TWatchSchemaOption, 'rootDir' | 'includePath'>,
) {
  if (isRelativeDtoPath(option)) {
    const dtoName = `${schemaId.replace('#/definitions/', '')}`;
    const relativePath = path.relative(option.rootDir, getDirnameSync(filePath)).replace('./', '');

    return getDtoName(
      dtoName,
      (v) => `#/${[relativePath, v].filter((element) => element !== '').join('/')}`,
    );
  }

  const dtoName = `${schemaId.replace('#/definitions/', '')}`;
  return dtoName;
}
