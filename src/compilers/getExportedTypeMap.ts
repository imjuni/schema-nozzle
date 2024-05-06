import { getSoruceFileExportedTypes } from '#/compilers/getSoruceFileExportedTypes';
import type { IExportedTypeInfo } from '#/compilers/interfaces/IExportedTypeInfo';
import type * as tsm from 'ts-morph';

export function getExportedTypeMap(
  project: tsm.Project,
  schemaFilePaths: string[],
): {
  exportedTypeMap: Map<string, IExportedTypeInfo>;
  fileExportedTypeMap: Map<string, IExportedTypeInfo[]>;
} {
  const exportedTypes = project
    .getSourceFiles()
    .map((sourceFile) => ({ sourceFile, filePath: sourceFile.getFilePath() }))
    .filter((sourceFile) => schemaFilePaths.includes(sourceFile.filePath))
    .map((sourceFile) => getSoruceFileExportedTypes(sourceFile.sourceFile))
    .flat();

  const exportedTypeMap = new Map<string, IExportedTypeInfo>(
    exportedTypes.map((exportedType) => {
      return [exportedType.typeName, exportedType];
    }),
  );

  const fileExportedTypeMap = new Map<string, IExportedTypeInfo[]>();

  exportedTypes.forEach((exportedType) => {
    const prev = fileExportedTypeMap.get(exportedType.filePath);

    if (prev == null) {
      fileExportedTypeMap.set(exportedType.filePath, [exportedType]);
    } else {
      fileExportedTypeMap.set(exportedType.filePath, [...prev, exportedType]);
    }
  });

  return { exportedTypeMap, fileExportedTypeMap };
}
