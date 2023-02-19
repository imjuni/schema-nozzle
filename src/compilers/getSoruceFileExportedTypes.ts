import getExportedName from '#compilers/getExportedName';
import getJsDocTags from '#compilers/getJsDocTags';
import { CE_JSDOC_EXTENDS } from '#modules/interfaces/CE_JSDOC_EXTENDS';
import * as tsm from 'ts-morph';

export interface IGetExportTypesReturnType {
  sourceFile: tsm.SourceFile;
  filePath: string;
  identifier: string;
  node: tsm.ExportedDeclarations;
}

export default function getSoruceFileExportedTypes(
  sourceFile: tsm.SourceFile,
): IGetExportTypesReturnType[] {
  const exportedTypes = Array.from(sourceFile.getExportedDeclarations().values()).flat();

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
