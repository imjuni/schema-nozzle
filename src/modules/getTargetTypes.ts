import getExportedType from '#compilers/getExportedType';
import getExportedTypes from '#compilers/getExportedTypes';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TDeleteSchemaOption from '#configs/interfaces/TDeleteSchemaOption';
import isSourceFileInclude from '#modules/isSourceFileInclude';
import type * as tsm from 'ts-morph';

interface IValidateFileType<T extends TDeleteSchemaOption | TAddSchemaOption> {
  project: tsm.Project;
  option: T;
}

export default function getTargetTypes<T extends TDeleteSchemaOption | TAddSchemaOption>({
  project,
  option,
}: IValidateFileType<T>) {
  const files = 'files' in option ? option.files : [];

  const allSourceFiles = project
    .getSourceFiles()
    .map((sourceFile) => ({ source: sourceFile, filePath: sourceFile.getFilePath().toString() }));

  const sourceFiles = allSourceFiles.filter((source) => {
    if ('files' in option) {
      return isSourceFileInclude(files, source.filePath);
    }

    return true;
  });

  const allExportedTypes = getExportedTypes({ project, option });

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
