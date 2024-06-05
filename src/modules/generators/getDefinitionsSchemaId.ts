import type { getKeys } from '#/databases/getKeys';
import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { replaceId } from '#/databases/modules/replaceId';
import { getEscaping } from '#/modules/generators/getEscaping';
import { getImportInfo } from '#/modules/generators/getImportInfo';
import { getIsExternal } from '#/modules/generators/getIsExternal';
import { getRelativePathByRootDirs } from '#/modules/paths/getRelativePathByRootDirs';
import { getDirnameSync } from 'my-node-fp';
import path from 'node:path';

export interface IGetDefinitionsSchemaId {
  keys: ReturnType<typeof getKeys>;

  /**
   * type-name of the schema
   * */
  typeName: string;

  /**
   * the file path to the file that exported the schema
   * */
  filePath?: string;

  /** url-encoding 및 pathId 옵션을 활성화 했을 때 경로에 포함된 encode 되지 않은 문자를 안전하게 변경할 것인지 결정 */
  encoding: {
    url: boolean;
    jsVar: boolean;
  };

  /** pathId 옵션을 활성화 했을 때 path에 relative를 적용하기 위한 root directory */
  rootDirs: string[];

  escapeChar: string;

  style:
    | typeof CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS
    | typeof CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS_WITH_PATH;
}

export function getDefinitionsSchemaId({
  keys,
  typeName,
  filePath,
  rootDirs,
  encoding,
  escapeChar,
  style,
}: IGetDefinitionsSchemaId): string {
  const escaping = getEscaping(encoding);
  const importInfo = getImportInfo(typeName);
  const isExternal = getIsExternal(importInfo);

  if (style === CE_SCHEMA_ID_GENERATION_STYLE.DEFINITIONS_WITH_PATH) {
    const moduleFilePath = filePath ?? importInfo?.moduleFilePath;
    const relativePath =
      moduleFilePath == null
        ? undefined
        : getRelativePathByRootDirs(rootDirs, '', getDirnameSync(moduleFilePath));

    const paths = [
      '#',
      keys.def,
      isExternal ? 'external' : undefined,
      isExternal ? undefined : relativePath,
      escaping(typeName, escapeChar),
    ].filter((element) => element != null && element !== '');

    return `${paths.join(path.posix.sep)}`;
  }

  if (isExternal) {
    const paths = ['#', keys.def, `external-${escaping(replaceId(typeName), escapeChar)}`].filter(
      (element) => element != null,
    );

    return `${paths.join(path.posix.sep)}`;
  }

  const paths = ['#', keys.def, escaping(replaceId(typeName), escapeChar)].filter(
    (element) => element != null,
  );

  return `${paths.join(path.posix.sep)}`;
}
