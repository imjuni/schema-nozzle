import getSoruceFileExportedTypes from '#/compilers/getSoruceFileExportedTypes';
import type IGetExportTypesReturnType from '#/compilers/interfaces/IGetExportTypesReturnType';
import type * as tsm from 'ts-morph';

export default function getExportedTypes(project: tsm.Project): IGetExportTypesReturnType[] {
  const exportedTypes = project
    .getSourceFiles()
    .map((sourceFile) => getSoruceFileExportedTypes(sourceFile))
    .flat();

  return exportedTypes;
}
