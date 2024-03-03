import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { TWatchSchemaOption } from '#/configs/interfaces/TWatchSchemaOption';
import { getDtoName } from '#/databases/modules/getDtoName';
import { isRelativeDtoPath } from '#/databases/modules/isRelativeDtoPath';
import { replaceId } from '#/databases/modules/replaceId';
import { getDirnameSync } from 'my-node-fp';
import path from 'node:path';
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
    const dtoName = replaceId(schemaId);
    const findedImportInfo = importInfos.find((importInfo) => importInfo.name === dtoName);

    if (findedImportInfo == null) {
      return getDtoName(dtoName, (name) => `#/$ext/${name}`);
    }

    if (findedImportInfo.isExternal || findedImportInfo.moduleFilePath == null) {
      return getDtoName(dtoName, (name) => `#/$ext/${name}`);
    }

    const relativePath = path
      .relative(option.rootDir, getDirnameSync(findedImportInfo.moduleFilePath))
      .replace('./', '');

    return getDtoName(
      dtoName,
      (name) => `#/${[relativePath, name].filter((element) => element !== '').join('/')}`,
    );
  }

  const dtoName = replaceId(schemaId);
  return dtoName;
}
