import getExportedName from '#compilers/getExportedName';
import { CE_JSDOC_EXTENDS } from '#modules/interfaces/CE_JSDOC_EXTENDS';
import * as tsm from 'ts-morph';

export interface IGetExportTypesReturnType {
  sourceFile: tsm.SourceFile;
  filePath: string;
  identifier: string;
  node: tsm.ExportedDeclarations;
}

function getJsDocTags(exportedDeclaration: tsm.ExportedDeclarations): tsm.JSDocTag[] {
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

export default function getExportedTypes(project: tsm.Project): IGetExportTypesReturnType[] {
  const exportedTypes = project
    .getSourceFiles()
    .map((sourceFile) => {
      const filePath = sourceFile.getFilePath().toString();
      return { sourceFile, filePath };
    })
    .map((source) => {
      const exportedDeclarationsMap = source.sourceFile.getExportedDeclarations();
      return Array.from(exportedDeclarationsMap.values()).flat();
    })
    .flat();

  const statements = exportedTypes
    .filter((exportedDeclaration) => {
      return (
        exportedDeclaration.getKind() === tsm.SyntaxKind.TypeAliasDeclaration ||
        exportedDeclaration.getKind() === tsm.SyntaxKind.InterfaceDeclaration ||
        exportedDeclaration.getKind() === tsm.SyntaxKind.ClassDeclaration ||
        exportedDeclaration.getKind() === tsm.SyntaxKind.EnumDeclaration
      );
    })
    .filter((exportedDeclaration) => {
      const tags = getJsDocTags(exportedDeclaration);
      const ignoreTag = tags.find(
        (tag) =>
          tag.getTagName() === CE_JSDOC_EXTENDS.IGNORE_TAG ||
          tag.getTagName() === CE_JSDOC_EXTENDS.IGNORE_TAG_ALIAS,
      );
      return ignoreTag == null;
    })
    .map((exportedType) => {
      return {
        sourceFile: exportedType.getSourceFile(),
        filePath: exportedType.getSourceFile().getFilePath().toString(),
        identifier: getExportedName(exportedType),
        node: exportedType,
      };
    });

  return statements;
}
