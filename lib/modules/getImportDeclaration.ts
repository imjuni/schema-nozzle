import * as tsm from 'ts-morph';

type TExportedNodeKind =
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
    .filter((node): node is TExportedNodeKind => node.typeName != null);

  const declarationMap: Record<string, TExportedNodeKind> = importDeclarations
    .filter((importDeclaration) => importDeclaration != null)
    .reduce((aggregation, declaration) => {
      return { ...aggregation, [declaration.typeName]: declaration };
    }, {});

  return declarationMap;
}
