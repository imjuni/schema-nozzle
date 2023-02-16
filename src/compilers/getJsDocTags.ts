import * as tsm from 'ts-morph';

export default function getJsDocTags(
  exportedDeclaration: tsm.ExportedDeclarations,
): tsm.JSDocTag[] {
  if (exportedDeclaration.getKind() === tsm.SyntaxKind.TypeAliasDeclaration) {
    return exportedDeclaration
      .asKindOrThrow(tsm.SyntaxKind.TypeAliasDeclaration)
      .getJsDocs()
      .flat()
      .map((docs) => docs.getTags())
      .flat();
  }

  if (exportedDeclaration.getKind() === tsm.SyntaxKind.InterfaceDeclaration) {
    return exportedDeclaration
      .asKindOrThrow(tsm.SyntaxKind.InterfaceDeclaration)
      .getJsDocs()
      .flat()
      .map((docs) => docs.getTags())
      .flat();
  }

  if (exportedDeclaration.getKind() === tsm.SyntaxKind.ClassDeclaration) {
    return exportedDeclaration
      .asKindOrThrow(tsm.SyntaxKind.ClassDeclaration)
      .getJsDocs()
      .flat()
      .map((docs) => docs.getTags())
      .flat();
  }

  return exportedDeclaration
    .asKindOrThrow(tsm.SyntaxKind.EnumDeclaration)
    .getJsDocs()
    .flat()
    .map((docs) => docs.getTags())
    .flat();
}
