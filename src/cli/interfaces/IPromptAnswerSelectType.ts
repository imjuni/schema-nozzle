import type * as tsm from 'ts-morph';

export interface IPromptAnswerSelectType {
  typeName: {
    filePath: string;
    identifier: string;
    exportedDeclaration: tsm.ExportedDeclarations;
  };
}
