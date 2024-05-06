import type { getExportedTypeMap } from '#/compilers/getExportedTypeMap';
import type { IExportedTypeInfo } from '#/compilers/interfaces/IExportedTypeInfo';
import { container } from '#/modules/containers/container';
import {
  STATEMENT_EXPORT_MAP_SYMBOL_KEY,
  STATEMENT_FILE_EXPORT_MAP_SYMBOL_KEY,
} from '#/modules/containers/keys';

export async function summarySchemaTypes(filePaths: string[], typeNames?: string[]) {
  const fileExportedInfoMap = container.resolve<
    ReturnType<typeof getExportedTypeMap>['fileExportedTypeMap']
  >(STATEMENT_FILE_EXPORT_MAP_SYMBOL_KEY);

  if (typeNames == null) {
    return filePaths
      .map((filePath) => fileExportedInfoMap.get(filePath))
      .filter((filePath): filePath is IExportedTypeInfo[] => filePath != null)
      .flat()
      .map((exportedInfo) => {
        return { typeName: exportedInfo.typeName, filePath: exportedInfo.filePath };
      })
      .filter(
        (importInfo): importInfo is { typeName: string; filePath: string } =>
          importInfo.filePath != null,
      );
  }

  const exportedInfoMap = container.resolve<
    ReturnType<typeof getExportedTypeMap>['exportedTypeMap']
  >(STATEMENT_EXPORT_MAP_SYMBOL_KEY);

  return typeNames
    .map((typeName) => exportedInfoMap.get(typeName))
    .filter((importInfo): importInfo is IExportedTypeInfo => importInfo != null)
    .map((importInfo) => ({ typeName: importInfo.typeName, filePath: importInfo.filePath }))
    .filter(
      (importInfo): importInfo is { typeName: string; filePath: string } =>
        importInfo.filePath != null,
    );
}
