import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import { getDtoName } from '#/databases/modules/getDtoName';
import { isRelativeDtoPath } from '#/databases/modules/isRelativeDtoPath';
import { replaceId } from '#/databases/modules/replaceId';
import { escapeId } from '#/modules/paths/escapeId';
import { getRelativePathByRootDirs } from '#/modules/paths/getRelativePathByRootDirs';
import { getDirnameSync } from 'my-node-fp';
import type { getImportInfoMap } from 'ts-morph-short';

export function getSchemaId(
  schemaId: string,
  importInfoMap: ReturnType<typeof getImportInfoMap>,
  option:
    | Pick<TAddSchemaOption, 'rootDirs'>
    | Pick<TRefreshSchemaOption, 'rootDirs'>
    | Pick<TDeleteSchemaOption, 'rootDirs'>,
  isEscape?: boolean,
) {
  const escaping = isEscape ?? true ? escapeId : (name: string) => name;

  if (isRelativeDtoPath(option)) {
    const dtoName = replaceId(schemaId);
    const importInfo = importInfoMap.get(dtoName);

    if (importInfo == null) {
      return getDtoName(dtoName, (name) => `#/ext/${escaping(name)}`);
    }

    if (importInfo.isExternal || importInfo.moduleFilePath == null) {
      return getDtoName(dtoName, (name) => `#/ext/${escaping(name)}`);
    }

    const relativePath = getRelativePathByRootDirs(
      option.rootDirs,
      getDirnameSync(importInfo.moduleFilePath),
    );

    return getDtoName(
      dtoName,
      (name) => `#/${[relativePath, escaping(name)].filter((element) => element !== '').join('/')}`,
    );
  }

  const dtoName = escaping(replaceId(schemaId));
  return dtoName;
}
