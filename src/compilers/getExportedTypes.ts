import { getSoruceFileExportedTypes } from '#/compilers/getSoruceFileExportedTypes';
import type { IGetExportTypesReturnType } from '#/compilers/interfaces/IGetExportTypesReturnType';
import type * as tsm from 'ts-morph';

export function getExportedTypes(
  project: tsm.Project,
  schemaFilePaths: string[],
): IGetExportTypesReturnType[] {
  const exportedTypes = project
    .getSourceFiles()
    .map((sourceFile) => ({ sourceFile, filePath: sourceFile.getFilePath() }))
    .filter((sourceFile) => schemaFilePaths.includes(sourceFile.filePath))
    .map((sourceFile) => getSoruceFileExportedTypes(sourceFile.sourceFile))
    .flat();

  return exportedTypes;
}
