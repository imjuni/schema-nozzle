import * as tsm from 'ts-morph';

type TExportedNodeKindWithoutImports =
  | {
      typeName: string;
      node: tsm.ClassDeclaration;
      kind: tsm.SyntaxKind.ClassDeclaration;
    }
  | {
      typeName: string;
      node: tsm.TypeAliasDeclaration;
      kind: tsm.SyntaxKind.TypeAliasDeclaration;
    }
  | {
      typeName: string;
      node: tsm.InterfaceDeclaration;
      kind: tsm.SyntaxKind.InterfaceDeclaration;
    }
  | {
      typeName: string;
      node: tsm.EnumDeclaration;
      kind: tsm.SyntaxKind.EnumDeclaration;
    };

type TExportedNodeImportKind =
  | {
      typeName: string;
      node: tsm.Identifier;
      kind: tsm.SyntaxKind.Identifier;
    }
  | {
      typeName: string;
      node: tsm.ImportSpecifier;
      kind: tsm.SyntaxKind.ImportSpecifier;
    };

interface IGetImportDeclarationArgs {
  project: tsm.Project;
}

export default function getImportDeclarationMap({ project }: IGetImportDeclarationArgs) {
  const importDeclarations = project
    .getSourceFiles()
    .map((sourceFile) => ({
      classes: sourceFile.getClasses(),
      typeAliases: sourceFile.getTypeAliases(),
      interfaces: sourceFile.getInterfaces(),
      enums: sourceFile.getEnums(),
    }))
    .map((exportDeclaration) => [
      ...exportDeclaration.classes.map((node) => ({
        typeName: node.getName(),
        node,
        kind: node.getKind(),
      })),
      ...exportDeclaration.typeAliases.map((node) => ({
        typeName: node.getName(),
        node,
        kind: node.getKind(),
      })),
      ...exportDeclaration.interfaces.map((node) => ({
        typeName: node.getName(),
        node,
        kind: node.getKind(),
      })),
      ...exportDeclaration.enums.map((node) => ({
        typeName: node.getName(),
        node,
        kind: node.getKind(),
      })),
    ])
    .flat()
    .filter((node): node is TExportedNodeKindWithoutImports => node.typeName != null);

  const declarationMap: Record<string, TExportedNodeKindWithoutImports> = importDeclarations
    .filter((importDeclaration) => importDeclaration != null)
    .reduce((aggregation, declaration) => {
      return { ...aggregation, [declaration.typeName]: declaration };
    }, {});

  const importDeclarationMap = project
    .getSourceFiles()
    .map((sourceFile) => {
      const namedImports = sourceFile
        .getImportDeclarations()
        .map((importDeclaration) => importDeclaration.getNamedImports())
        .flat()
        .map((importSpecifier) => {
          const exportedNodeImportKind: TExportedNodeImportKind = {
            typeName: importSpecifier.getName(),
            node: importSpecifier,
            kind: tsm.SyntaxKind.ImportSpecifier,
          };

          return exportedNodeImportKind;
        });

      const defaultImports = sourceFile
        .getImportDeclarations()
        .map((importDeclaration) => {
          return {
            importDeclaration,
            identifier: importDeclaration.getDefaultImport(),
          };
        })
        .flat()
        .filter(
          (
            declaration,
          ): declaration is {
            importDeclaration: tsm.ImportDeclaration;
            identifier: tsm.Identifier;
          } => declaration.identifier != null,
        )
        .map((declaration) => {
          const exportedNodeImportKind: TExportedNodeImportKind = {
            typeName: declaration.identifier.getText(),
            node: declaration.identifier,
            kind: tsm.SyntaxKind.Identifier,
          };

          return exportedNodeImportKind;
        });

      return { namedImports, defaultExports: defaultImports };
    })
    .map((imports) => {
      return [...imports.defaultExports, ...imports.namedImports];
    })
    .flat()
    .reduce<Record<string, TExportedNodeImportKind>>((aggregation, declaration) => {
      if (declarationMap[declaration.typeName] != null) {
        return aggregation;
      }

      if (aggregation[declaration.typeName] == null) {
        return { ...aggregation, [declaration.typeName]: declaration };
      }

      return aggregation;
    }, {});

  return { ...declarationMap, ...importDeclarationMap };
}
