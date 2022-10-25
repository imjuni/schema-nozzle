import IPromptAnswerSelectType from '@cli/interfaces/IPromptAnswerSelectType';
import getExportedName from '@compilers/getExportedName';
import getExportedType from '@compilers/getExportedType';
import { TEXPORTED_TYPE } from '@compilers/interfaces/TEXPORTED_TYPE';
import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { first } from 'my-easy-fp';
import path from 'path';
import * as tsm from 'ts-morph';

interface IChoiceTypeItem {
  filePath: string;
  identifier: string;
  exportedDeclaration: tsm.ExportedDeclarations;
  type: TEXPORTED_TYPE;
}

interface IGetTypesFromPrompt {
  project: tsm.Project;
  option: IAddSchemaOption;
}

const weight: Record<TEXPORTED_TYPE, number> = {
  [TEXPORTED_TYPE.CLASS]: 3,
  [TEXPORTED_TYPE.VARIABLE]: Number.MAX_SAFE_INTEGER,
  [TEXPORTED_TYPE.FUNCTION]: Number.MAX_SAFE_INTEGER,
  [TEXPORTED_TYPE.ARROW_FUNCTION]: Number.MAX_SAFE_INTEGER,
  [TEXPORTED_TYPE.INTERFACE]: 1,
  [TEXPORTED_TYPE.TYPE_ALIAS]: 2,
  [TEXPORTED_TYPE.ENUM]: 4,
  [TEXPORTED_TYPE.MODULE]: Number.MAX_SAFE_INTEGER,
  [TEXPORTED_TYPE.BINDING_ELEMENT]: Number.MAX_SAFE_INTEGER,
};

export default async function getAddTypesFromPrompt({
  project,
  option,
}: IGetTypesFromPrompt): Promise<string[]> {
  const choiceAbleTypes = option.files
    .map((filePath) => {
      const fileName = path.basename(filePath);
      const sourceFile = project.getSourceFileOrThrow(fileName);
      const exportedDeclarationsMap = sourceFile.getExportedDeclarations();

      const types = Array.from(exportedDeclarationsMap.entries())
        .map(([key, value]) => ({ key, exportedDeclarations: value }))
        .map<IChoiceTypeItem[]>((item) => {
          return item.exportedDeclarations.map((exportedDeclaration) => ({
            filePath,
            exportedDeclaration,
            identifier: getExportedName(exportedDeclaration),
            type: getExportedType(exportedDeclaration),
          }));
        })
        .flat();

      return types;
    })
    .flat()
    .map<{
      name: string;
      value: IChoiceTypeItem;
    }>((choiceAbleType) => ({ name: choiceAbleType.identifier, value: choiceAbleType }))
    .sort((l, r) => {
      const diff = weight[l.value.type] - weight[r.value.type];
      return diff !== 0 ? diff : l.value.filePath.localeCompare(r.value.filePath);
    });

  if (choiceAbleTypes.length <= 0) {
    throw new Error('Cannot found interface or type-alias on typescript source file');
  }

  if (choiceAbleTypes.length === 1) {
    const autoSelectedIdentifier = first(choiceAbleTypes).value.identifier;
    console.log(
      `${chalk.green(
        '?',
      )} Select type(interface or type alias) for JSONSchema extraction:  ${chalk.cyan(
        autoSelectedIdentifier,
      )}`,
    );

    return [first(choiceAbleTypes).value.identifier];
  }

  const answer = await inquirer.prompt<IPromptAnswerSelectType>([
    {
      type: 'list',
      name: 'typeName',
      pageSize: 20,
      message: 'Select type(interface or type alias) for JSONSchema extraction: ',
      choices: choiceAbleTypes,
    },
  ]);

  return [answer.typeName.identifier];
}
