import { settify } from 'my-easy-fp';
import * as tsm from 'ts-morph';

export default function getExportedFiles(project: tsm.Project): string[] {
  const sourceFilePaths = project
    .getSourceFiles()
    .map((sourceFile) => {
      const exportedDeclarationsMap = sourceFile.getExportedDeclarations();

      const filePaths = Array.from(exportedDeclarationsMap.entries())
        .map(([key, value]) => ({ key, exportedDeclarations: value }))
        .map((item) => {
          return item.exportedDeclarations.map((exportedDeclaration) => ({
            filePath: sourceFile.getFilePath(),
            exportedDeclaration,
          }));
        })
        .flat()
        .filter(
          (exported) =>
            exported.exportedDeclaration.getKind() === tsm.SyntaxKind.TypeAliasDeclaration ||
            exported.exportedDeclaration.getKind() === tsm.SyntaxKind.InterfaceDeclaration ||
            exported.exportedDeclaration.getKind() === tsm.SyntaxKind.ClassDeclaration ||
            exported.exportedDeclaration.getKind() === tsm.SyntaxKind.EnumDeclaration,
        )
        .map((exported) => exported.exportedDeclaration.getSourceFile().getFilePath());

      return filePaths;
    })
    .flat();

  const filePaths = settify(sourceFilePaths);

  return filePaths;
}
