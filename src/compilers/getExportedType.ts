import { CE_EXPORTED_TYPE } from 'src/compilers/interfaces/CE_EXPORTED_TYPE';
import * as tsm from 'ts-morph';

export default function getExportedType(
  exportedDeclarationNode: tsm.ExportedDeclarations,
): CE_EXPORTED_TYPE {
  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.ClassDeclaration) != null) {
    return CE_EXPORTED_TYPE.CLASS;
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.VariableDeclaration) != null) {
    return CE_EXPORTED_TYPE.VARIABLE;
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.ArrowFunction) != null) {
    const arrowFunctionNode = exportedDeclarationNode.asKindOrThrow(tsm.SyntaxKind.ArrowFunction);
    const name = arrowFunctionNode.getSymbolOrThrow().getEscapedName();

    if (name === '__function') {
      throw new Error(
        `JSONSchema cannot generate from anonymous arrow function: ${arrowFunctionNode
          .getSourceFile()
          .getFilePath()
          .toString()} ${arrowFunctionNode.getText()}`,
      );
    }

    return CE_EXPORTED_TYPE.ARROW_FUNCTION;
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.FunctionDeclaration) != null) {
    const functionDeclarationNode = exportedDeclarationNode.asKindOrThrow(
      tsm.SyntaxKind.FunctionDeclaration,
    );

    const name = functionDeclarationNode.getName();

    if (name == null) {
      throw new Error(
        `JSONSchema cannot generate from anonymous function: ${functionDeclarationNode
          .getSourceFile()
          .getFilePath()
          .toString()} ${functionDeclarationNode.getText()}`,
      );
    }

    return CE_EXPORTED_TYPE.FUNCTION;
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.InterfaceDeclaration) != null) {
    return CE_EXPORTED_TYPE.INTERFACE;
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.TypeAliasDeclaration) != null) {
    return CE_EXPORTED_TYPE.TYPE_ALIAS;
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.EnumDeclaration) != null) {
    return CE_EXPORTED_TYPE.ENUM;
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.ModuleDeclaration) != null) {
    return CE_EXPORTED_TYPE.MODULE;
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.ArrayLiteralExpression) != null) {
    throw new Error(
      `JSONSchema cannot generate from array literal: ${exportedDeclarationNode
        .getSourceFile()
        .getFilePath()
        .toString()} ${exportedDeclarationNode.getText()}`,
    );
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.ObjectLiteralExpression) != null) {
    throw new Error(
      `JSONSchema cannot generate object literal: ${exportedDeclarationNode
        .getSourceFile()
        .getFilePath()
        .toString()} ${exportedDeclarationNode.getText()}`,
    );
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.BindingElement) != null) {
    return CE_EXPORTED_TYPE.BINDING_ELEMENT;
  }

  throw new Error(
    `Cannot support type: ${exportedDeclarationNode
      .getSourceFile()
      .getFilePath()
      .toString()} (${exportedDeclarationNode.getKind()}) ${exportedDeclarationNode.getText()}`,
  );
}
