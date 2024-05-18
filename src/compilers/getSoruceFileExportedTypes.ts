import { getJsDocTag } from '#/compilers/comments/getJsDocTag';
import { getJsDocTags } from '#/compilers/comments/getJsDocTags';
import { getExportedName } from '#/compilers/getExportedName';
import type { getExportedTypes } from '#/compilers/getExportedTypes';
import { CE_JSDOC_EXTENDS } from '#/modules/const-enum/CE_JSDOC_EXTENDS';
import * as tsm from 'ts-morph';

export function getSoruceFileExportedTypes(
  sourceFile: tsm.SourceFile,
): ReturnType<typeof getExportedTypes> {
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
          getJsDocTag(tag.getTagName()) === getJsDocTag(CE_JSDOC_EXTENDS.IGNORE_TAG) ||
          getJsDocTag(tag.getTagName()) === getJsDocTag(CE_JSDOC_EXTENDS.IGNORE_TAG_ALIAS),
      );
      return ignoreTag == null;
    })
    .map((exportedType) => {
      return {
        sourceFile: exportedType.getSourceFile(),
        filePath: exportedType.getSourceFile().getFilePath().toString(),
        typeName: getExportedName(exportedType),
        node: exportedType,
      };
    });

  return statements;
}
