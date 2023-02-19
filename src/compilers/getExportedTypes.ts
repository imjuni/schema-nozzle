import getSoruceFileExportedTypes from '#compilers/getSoruceFileExportedTypes';
import type * as tsm from 'ts-morph';

export interface IGetExportTypesReturnType {
  sourceFile: tsm.SourceFile;
  filePath: string;
  identifier: string;
  node: tsm.ExportedDeclarations;
}

export default function getExportedTypes(project: tsm.Project): IGetExportTypesReturnType[] {
  const exportedTypes = project
    .getSourceFiles()
    .map((sourceFile) => getSoruceFileExportedTypes(sourceFile))
    .flat();

  return exportedTypes;
}
