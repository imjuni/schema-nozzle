import getExportedName from '@compilers/getExportedName';
import type IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import type IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import isSourceFileInclude from '@modules/isSourceFileInclude';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';
import type * as tsm from 'ts-morph';

/**
 * getExportTypes function params
 */
interface IGetAllExportTypesParams<T extends IDeleteSchemaOption | IAddSchemaOption> {
  project: tsm.Project;
  option: T;
}

interface IGetExportTypesReturn {
  sourceFile: tsm.SourceFile;
  filePath: string;
  identifier: string;
  node: tsm.ExportedDeclarations;
}

export default function getAllExportedTypes<T extends IDeleteSchemaOption | IAddSchemaOption>({
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
      .filter((source) => {
        if ('files' in option) {
          return isSourceFileInclude(option.files, source.filePath);
        }

        return true;
      })
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
