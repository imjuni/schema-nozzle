import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { replaceId } from '#/databases/modules/replaceId';
import { getImportInfo } from '#/modules/generators/getImportInfo';
import { escapeId } from '#/modules/paths/escapeId';
import { getRelativePathByRootDirs } from '#/modules/paths/getRelativePathByRootDirs';
import { getDirnameSync } from 'my-node-fp';
import path from 'node:path';

export interface IGetPlainSchemaIdParams {
  /**
   * type-name of the schema
   * */
  typeName: string;

  /**
   * the file path to the file that exported the schema
   * */
  filePath?: string;

  /** url-encoding 및 pathId 옵션을 활성화 했을 때 경로에 포함된 encode 되지 않은 문자를 안전하게 변경할 것인지 결정 */
  isEscape: boolean;

  /** pathId 옵션을 활성화 했을 때 path에 relative를 적용하기 위한 root directory */
  rootDirs: string[];

  escapeChar: string;

  style:
    | typeof CE_SCHEMA_ID_GENERATION_STYLE.ID
    | typeof CE_SCHEMA_ID_GENERATION_STYLE.ID_WITH_PATH;
}

export function getPlainSchemaId({
  typeName,
  filePath,
  rootDirs,
  isEscape,
  escapeChar,
  style,
}: IGetPlainSchemaIdParams): string {
  const escaping = isEscape ? escapeId : (name: string, _escapeChar: string) => name;
  const importInfo = getImportInfo(typeName);
  const isExternal = importInfo == null || importInfo?.moduleFilePath == null;

  if (style === CE_SCHEMA_ID_GENERATION_STYLE.ID_WITH_PATH) {
    const moduleFilePath = filePath ?? importInfo?.moduleFilePath;
    const relativePath =
      moduleFilePath == null
        ? undefined
        : getRelativePathByRootDirs(rootDirs, getDirnameSync(moduleFilePath));
    const paths = [
      isExternal ? 'external' : undefined,
      relativePath,
      escaping(replaceId(typeName), escapeChar),
    ].filter((element) => element != null);
    return `${paths.join(path.posix.sep)}`;
  }

  const paths = [
    isExternal ? 'external' : undefined,
    escaping(replaceId(typeName), escapeChar),
  ].filter((element) => element != null);

  return `${paths.join(path.posix.sep)}`;
}
