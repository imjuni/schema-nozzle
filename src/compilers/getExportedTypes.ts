import { getSoruceFileExportedTypes } from '#/compilers/getSoruceFileExportedTypes';
import type * as tsm from 'ts-morph';

interface IGetExportTypesReturnType {
  sourceFile: tsm.SourceFile;
  filePath: string;
  identifier: string;
  node: tsm.ExportedDeclarations;
}

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
