import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { TWatchSchemaOption } from '#/configs/interfaces/TWatchSchemaOption';
import { getDtoName } from '#/databases/modules/getDtoName';
import { isRelativeDtoPath } from '#/databases/modules/isRelativeDtoPath';
import { getDirnameSync } from 'my-node-fp';
import path from 'path';
import type { getFileImportInfos } from 'ts-morph-short';

export function getSchemaId(
  schemaId: string,
  importInfos: ReturnType<typeof getFileImportInfos>,
  option:
    | Pick<TAddSchemaOption, 'rootDir'>
    | Pick<TRefreshSchemaOption, 'rootDir'>
    | Pick<TWatchSchemaOption, 'rootDir'>,
) {
  if (isRelativeDtoPath(option)) {
    const dtoName = `${schemaId.replace('#/definitions/', '')}`;
    const findedImportInfo = importInfos.find((importInfo) => importInfo.name === dtoName);

    if (findedImportInfo == null) {
      return getDtoName(dtoName, (v) => `#/external/${v}`);
    }

    if (findedImportInfo.isExternal || findedImportInfo.moduleFilePath == null) {
      return getDtoName(dtoName, (v) => `#/external/${v}`);
    }

    const relativePath = path
      .relative(option.rootDir, getDirnameSync(findedImportInfo.moduleFilePath))
      .replace('./', '');

    return getDtoName(
      dtoName,
      (v) => `#/${[relativePath, v].filter((element) => element !== '').join('/')}`,
    );
  }

  const dtoName = `${schemaId.replace('#/definitions/', '')}`;
  return dtoName;
}
