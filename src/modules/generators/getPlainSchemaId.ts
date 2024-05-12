import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { getEscaping } from '#/modules/generators/getEscaping';
import { getImportInfo } from '#/modules/generators/getImportInfo';
import { getIsExternal } from '#/modules/generators/getIsExternal';
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

  /** pathId 옵션을 활성화 했을 때 path에 relative를 적용하기 위한 root directory */
  rootDirs: string[];

  escapeChar: string;

  /** url-encoding 및 pathId 옵션을 활성화 했을 때 경로에 포함된 encode 되지 않은 문자를 안전하게 변경할 것인지 결정 */
  encoding: {
    url: boolean;
    jsVar: boolean;
  };

  style:
    | typeof CE_SCHEMA_ID_GENERATION_STYLE.ID
    | typeof CE_SCHEMA_ID_GENERATION_STYLE.ID_WITH_PATH;
}

/**
 * traverser() 함수에서 전달하는 id는 encodedRefs 옵션에 의해서 이미 url-encode 끝난 상태이다.
 * 그래서 이 때는 url-encode 할 필요가 없고, replace escape char만 필요하다.
 */
export function getPlainSchemaId({
  typeName,
  filePath,
  rootDirs,
  escapeChar,
  encoding,
  style,
}: IGetPlainSchemaIdParams): string {
  const escaping = getEscaping(encoding);
  const importInfo = getImportInfo(typeName);
  const isExternal = getIsExternal(importInfo);

  if (style === CE_SCHEMA_ID_GENERATION_STYLE.ID_WITH_PATH) {
    const moduleFilePath = filePath ?? importInfo?.moduleFilePath;
    const relativePath =
      moduleFilePath == null
        ? undefined
        : getRelativePathByRootDirs(rootDirs, '', getDirnameSync(moduleFilePath));
    const paths = [
      isExternal ? 'external' : undefined,
      isExternal ? undefined : relativePath,
      escaping(typeName, escapeChar),
    ].filter((element) => element != null && element !== '');
    return `${paths.join(path.posix.sep)}`;
  }

  const paths = [
    isExternal ? `external-${escaping(typeName, escapeChar)}` : escaping(typeName, escapeChar),
  ].filter((element) => element != null);

  return `${paths.join(path.posix.sep)}`;
}
