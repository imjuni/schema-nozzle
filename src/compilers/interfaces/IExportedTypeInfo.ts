import type * as tsm from 'ts-morph';

export interface IExportedTypeInfo {
  sourceFile: tsm.SourceFile;
  filePath: string;
  typeName: string;
  node: tsm.ExportedDeclarations;
}
