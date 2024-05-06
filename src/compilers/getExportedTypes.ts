import { getSoruceFileExportedTypes } from '#/compilers/getSoruceFileExportedTypes';
import type { IExportedTypeInfo } from '#/compilers/interfaces/IExportedTypeInfo';
import type * as tsm from 'ts-morph';

export function getExportedTypes(
  project: tsm.Project,
  schemaFilePaths: string[],
): IExportedTypeInfo[] {
  const exportedTypes = project
    .getSourceFiles()
    .map((sourceFile) => ({ sourceFile, filePath: sourceFile.getFilePath() }))
    .filter((sourceFile) => schemaFilePaths.includes(sourceFile.filePath))
    .map((sourceFile) => getSoruceFileExportedTypes(sourceFile.sourceFile))
    .flat();

  return exportedTypes;
}
