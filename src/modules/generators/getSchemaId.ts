import { CE_SCHEMA_ID_GENERATION_STYLE } from '#/databases/modules/const-enum/CE_SCHEMA_ID_GENERATION_STYLE';
import { getDefinitionsSchemaId } from '#/modules/generators/getDefinitionsSchemaId';
import { getPlainSchemaId } from '#/modules/generators/getPlainSchemaId';

export interface ISchemaIdParams {
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

  style: CE_SCHEMA_ID_GENERATION_STYLE;
}

export function getSchemaId({
  typeName,
  style,
  filePath,
  isEscape,
  rootDirs,
  escapeChar,
}: ISchemaIdParams): string {
  if (
    style === CE_SCHEMA_ID_GENERATION_STYLE.ID ||
    style === CE_SCHEMA_ID_GENERATION_STYLE.ID_WITH_PATH
  ) {
    const id = getPlainSchemaId({
      typeName,
      style,
      filePath,
      isEscape,
      rootDirs,
      escapeChar,
    });

    return id;
  }

  const id = getDefinitionsSchemaId({
    typeName,
    style,
    filePath,
    isEscape,
    rootDirs,
    escapeChar,
  });

  return id;
}
