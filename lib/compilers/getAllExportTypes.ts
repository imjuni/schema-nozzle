import getExportedName from '@compilers/getExportedName';
import IConsoleOption from '@configs/interfaces/IConsoleOption';
import IDatabaseOption from '@configs/interfaces/IDatabaseOption';
import isFilterByModifier from '@modules/isFilterByModifier';
import { isError } from 'my-easy-fp';
import { fail, pass, PassFailEither } from 'my-only-either';
import * as tsm from 'ts-morph';

/**
 * getExportTypes function params
 */
interface IGetAllExportTypesParams<T extends IConsoleOption | IDatabaseOption> {
  project: tsm.Project;
  option: T;
}

interface IGetExportTypesReturn {
  sourceFile: tsm.SourceFile;
  filePath: string;
  identifier: string;
  node: tsm.ExportedDeclarations;
}

export default function getAllExportedTypes<T extends IConsoleOption | IDatabaseOption>({
  project,
  option,
}: IGetAllExportTypesParams<T>): PassFailEither<Error, IGetExportTypesReturn[]> {
  try {
    const exportStatements = project
      .getSourceFiles()
      .map((sourceFile) => {
        const filePath = sourceFile.getFilePath().toString();
        return { sourceFile, filePath };
      })
      .filter((source) => isFilterByModifier(option, source.filePath))
      .filter((source) => option.files.includes(source.filePath))
      .map((source) => {
        const exportedDeclarationsMap = source.sourceFile.getExportedDeclarations();

        const exportedTypes = Array.from(exportedDeclarationsMap.values())
          .map((exportedDeclarations) => {
            return exportedDeclarations.map((exportedDeclaration) => ({
              filePath: source.sourceFile.getFilePath().toString(),
              identifier: getExportedName(exportedDeclaration),
              exportedDeclarations: exportedDeclaration,
            }));
          })
          .flat();

        return exportedTypes.map((exportType) => ({
          sourceFile: source.sourceFile,
          filePath: source.filePath,
          exportedDeclarations: exportType,
        }));
      })
      .flat();

    return pass(
      exportStatements.map((statement) => ({
        sourceFile: statement.sourceFile,
        filePath: statement.filePath,
        identifier: statement.exportedDeclarations.identifier,
        node: statement.exportedDeclarations.exportedDeclarations,
      })),
    );
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised');
    return fail(err);
  }
}
