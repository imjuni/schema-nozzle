import { TEXPORTED_TYPE } from '@compilers/interfaces/TEXPORTED_TYPE';
import * as tsm from 'ts-morph';

export default function getExportedType(
  exportedDeclarationNode: tsm.ExportedDeclarations,
): TEXPORTED_TYPE {
  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.ClassDeclaration) != null) {
    return TEXPORTED_TYPE.CLASS;
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.VariableDeclaration) != null) {
    return TEXPORTED_TYPE.VARIABLE;
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.ArrowFunction) != null) {
    const arrowFunctionNode = exportedDeclarationNode.asKindOrThrow(tsm.SyntaxKind.ArrowFunction);
    const name = arrowFunctionNode.getSymbolOrThrow().getEscapedName();

    if (name === '__function') {
      throw new Error('cannot generate JSONSchema using by anonymous arrow function');
    }

    return TEXPORTED_TYPE.ARROW_FUNCTION;
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.FunctionDeclaration) != null) {
    const functionDeclarationNode = exportedDeclarationNode.asKindOrThrow(
      tsm.SyntaxKind.FunctionDeclaration,
    );

    const name = functionDeclarationNode.getName();

    if (name == null) {
      throw new Error('cannot generate JSONSchema using by anonymous function');
    }

    return TEXPORTED_TYPE.FUNCTION;
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.InterfaceDeclaration) != null) {
    return TEXPORTED_TYPE.INTERFACE;
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.TypeAliasDeclaration) != null) {
    return TEXPORTED_TYPE.TYPE_ALIAS;
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.EnumDeclaration) != null) {
    return TEXPORTED_TYPE.ENUM;
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.ModuleDeclaration) != null) {
    return TEXPORTED_TYPE.MODULE;
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.ArrayLiteralExpression) != null) {
    throw new Error('cannot generate JSONSchema using by array literal');
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.ObjectLiteralExpression) != null) {
    throw new Error('cannot generate JSONSchema using by object literal');
  }

  if (exportedDeclarationNode.asKind(tsm.SyntaxKind.BindingElement) != null) {
    return TEXPORTED_TYPE.BINDING_ELEMENT;
  }

  throw new Error(
    `Cannot support type: (${exportedDeclarationNode.getKind()}) ${exportedDeclarationNode.getText()}`,
  );
}
