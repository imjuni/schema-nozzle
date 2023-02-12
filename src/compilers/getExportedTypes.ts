import getExportedName from '#compilers/getExportedName';
import * as tsm from 'ts-morph';

export interface IGetExportTypesReturnType {
  sourceFile: tsm.SourceFile;
  filePath: string;
  identifier: string;
  node: tsm.ExportedDeclarations;
}

export default function getExportedTypes(project: tsm.Project): IGetExportTypesReturnType[] {
  const types = project
    .getSourceFiles()
    .map((sourceFile) => {
      const filePath = sourceFile.getFilePath().toString();
      return { sourceFile, filePath };
    })
    .map((source) => {
      const exportedDeclarationsMap = source.sourceFile.getExportedDeclarations();
      const exportedTypes = Array.from(exportedDeclarationsMap.values())
        .map((exportedDeclarations) => {
          return exportedDeclarations.map((exportedDeclaration) => ({
            filePath: source.sourceFile.getFilePath().toString(),
            identifier: getExportedName(exportedDeclaration),
            node: exportedDeclaration,
          }));
        })
        .flat();

      return exportedTypes.map((exportType) => ({
        filePath: source.filePath,
        sourceFile: source.sourceFile,
        identifier: exportType.identifier,
        node: exportType.node,
      }));
    })
    .flat();

  const statements = types.filter((exportedDeclaration) => {
    return (
      exportedDeclaration.node.getKind() === tsm.SyntaxKind.TypeAliasDeclaration ||
      exportedDeclaration.node.getKind() === tsm.SyntaxKind.InterfaceDeclaration ||
      exportedDeclaration.node.getKind() === tsm.SyntaxKind.ClassDeclaration ||
      exportedDeclaration.node.getKind() === tsm.SyntaxKind.EnumDeclaration
    );
  });

  return statements.map((statement) => ({
    sourceFile: statement.sourceFile,
    filePath: statement.filePath,
    identifier: statement.identifier,
    node: statement.node,
  }));
}
