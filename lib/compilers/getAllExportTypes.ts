import getExportedName from '@compilers/getExportedName';
import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import isFilterByModifier from '@modules/isFilterByModifier';
import isSourceFileInclude from '@modules/isSourceFileInclude';
import { isError } from 'my-easy-fp';
import { fail, pass, PassFailEither } from 'my-only-either';
import * as tsm from 'ts-morph';

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
      .filter((source) => isFilterByModifier(option, source.filePath))
      .filter((source) => isSourceFileInclude(option.files, source.filePath))
      .map((source) => {
        const exportedDeclarationsMap = source.sourceFile.getExportedDeclarations();

        const exportedTypes = Array.from(exportedDeclarationsMap.values())
          .map((exportedDeclarations) => {
            return exportedDeclarations.map((exportedDeclaration) => ({
              filePath: source.sourceFile.getFilePath().toString(),
              identifier: getExportedName(exportedDeclaration),
              exportedDeclarations: exportedDeclaration,
              importMap: {
                typeAlias: source.sourceFile.getTypeAliases(),
                interface: source.sourceFile.getInterfaces(),
                class: source.sourceFile.getClasses(),
                enum: source.sourceFile.getEnums(),
                variable: source.sourceFile.getVariableDeclarations(),
              },
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
