import type { getFileImportInfoMap } from '#/compilers/getFileImportInfoMap';
import { container } from '#/modules/containers/container';
import {
  STATEMENT_FILE_IMPORT_MAP_SYMBOL_KEY,
  STATEMENT_IMPORT_MAP_SYMBOL_KEY,
} from '#/modules/containers/keys';
import type { IImportInfoMapElement, getImportInfoMap } from 'ts-morph-short';

export async function summarySchemaTypes(filePaths: string[], typeNames?: string[]) {
  const fileImportInfoMap = container.resolve<ReturnType<typeof getFileImportInfoMap>>(
    STATEMENT_FILE_IMPORT_MAP_SYMBOL_KEY,
  );

  if (typeNames == null) {
    return filePaths
      .map((filePath) => fileImportInfoMap.get(filePath))
      .filter((filePath): filePath is IImportInfoMapElement[] => filePath != null)
      .flat()
      .map((importInfo) => {
        return { typeName: importInfo.name, filePath: importInfo.moduleFilePath };
      })
      .filter(
        (importInfo): importInfo is { typeName: string; filePath: string } =>
          importInfo.filePath != null,
      );
  }

  const importInfoMap = container.resolve<ReturnType<typeof getImportInfoMap>>(
    STATEMENT_IMPORT_MAP_SYMBOL_KEY,
  );
  return typeNames
    .map((typeName) => importInfoMap.get(typeName))
    .filter((importInfo): importInfo is IImportInfoMapElement => importInfo != null)
    .map((importInfo) => ({ typeName: importInfo.name, filePath: importInfo.moduleFilePath }))
    .filter(
      (importInfo): importInfo is { typeName: string; filePath: string } =>
        importInfo.filePath != null,
    );
}
