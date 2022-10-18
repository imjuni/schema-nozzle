import getAllExportedTypes from '@compilers/getAllExportTypes';
import getExportedType from '@compilers/getExportedType';
import IConsoleOption from '@configs/interfaces/IConsoleOption';
import IDatabaseOption from '@configs/interfaces/IDatabaseOption';
import isFilterByModifier from '@modules/isFilterByModifier';
import * as tsm from 'ts-morph';

interface IValidateFileType<T extends IConsoleOption | IDatabaseOption> {
  project: tsm.Project;
  option: T;
}

export default function getTargetTypes<T extends IConsoleOption | IDatabaseOption>({
  project,
  option,
}: IValidateFileType<T>) {
  const { files } = option;

  const allSourceFiles = project
    .getSourceFiles()
    .map((sourceFile) => ({ source: sourceFile, filePath: sourceFile.getFilePath().toString() }));

  const sourceFiles = allSourceFiles
    .filter((sourceFile) => isFilterByModifier(option, sourceFile.filePath))
    .filter((source) => files.includes(source.filePath));

  const allExportedTypes = getAllExportedTypes({ project, option });

  if (allExportedTypes.type === 'fail') {
    throw allExportedTypes.fail;
  }

  const exportedTypes = allExportedTypes.pass.filter((exportedType) =>
    option.types.includes(exportedType.identifier),
  );

  return {
    sourceFiles,
    exportedTypes: exportedTypes.map((exportedType) => ({
      sourceFile: exportedType.sourceFile,
      filePath: exportedType.filePath,
      identifier: exportedType.identifier,
      node: exportedType.node,
      type: getExportedType(exportedType.node),
    })),
  };
}
