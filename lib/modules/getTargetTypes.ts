import getAllExportedTypes from '@compilers/getAllExportTypes';
import getExportedType from '@compilers/getExportedType';
import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import isFilterByModifier from '@modules/isFilterByModifier';
import isSourceFileInclude from '@modules/isSourceFileInclude';
import * as tsm from 'ts-morph';

interface IValidateFileType<T extends IDeleteSchemaOption | IAddSchemaOption> {
  project: tsm.Project;
  option: T;
}

export default function getTargetTypes<T extends IDeleteSchemaOption | IAddSchemaOption>({
  project,
  option,
}: IValidateFileType<T>) {
  const { files } = option;

  const allSourceFiles = project
    .getSourceFiles()
    .map((sourceFile) => ({ source: sourceFile, filePath: sourceFile.getFilePath().toString() }));

  const sourceFiles = allSourceFiles
    .filter((sourceFile) => isFilterByModifier(option, sourceFile.filePath))
    .filter((source) => isSourceFileInclude(files, source.filePath));

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
