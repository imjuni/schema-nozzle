import type IPromptAnswerSelectType from '@cli/interfaces/IPromptAnswerSelectType';
import getExportedName from '@compilers/getExportedName';
import getExportedType from '@compilers/getExportedType';
import { TEXPORTED_TYPE } from '@compilers/interfaces/TEXPORTED_TYPE';
import type IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import { CE_FUZZY_SCORE_LIMIT } from '@modules/interfaces/CE_FUZZY_SCORE_LIMIT';
import type IFileWithType from '@modules/interfaces/IFileWithType';
import getRatioNumber from '@tools/getRatioNumber';
import logger from '@tools/logger';
import chalk from 'chalk';
import Fuse from 'fuse.js';
import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import { CheckboxPlusPrompt } from 'inquirer-ts-checkbox-plus-prompt';
import { first } from 'my-easy-fp';
import * as tsm from 'ts-morph';

const log = logger();

interface IChoiceTypeItem {
  filePath: string;
  identifier: string;
  exportedDeclaration: tsm.ExportedDeclarations;
  type: TEXPORTED_TYPE;
}

interface IGetTypesFromPromptArgs {
  project: tsm.Project;
  option: IAddSchemaOption;
  isMultipleSelect: boolean;
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
  isMultipleSelect,
}: IGetTypesFromPromptArgs): Promise<IFileWithType[]> {
  const choiceAbleTypes = option.files
    .map((filePath) => {
      const sourceFile = project.getSourceFileOrThrow(filePath);
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
    .filter(
      (choiceAbleType) =>
        choiceAbleType.exportedDeclaration.getKind() === tsm.SyntaxKind.TypeAliasDeclaration ||
        choiceAbleType.exportedDeclaration.getKind() === tsm.SyntaxKind.InterfaceDeclaration ||
        choiceAbleType.exportedDeclaration.getKind() === tsm.SyntaxKind.ClassDeclaration,
    )
    .map((choiceAbleType) => {
      return {
        name: choiceAbleType.identifier,
        identifier: choiceAbleType.identifier,
        filePath: choiceAbleType.filePath,
        value: choiceAbleType,
        disabled: false,
      };
    })
    .sort((l, r) => {
      const diff = weight[l.value.type] - weight[r.value.type];
      return diff !== 0 ? diff : l.value.filePath.localeCompare(r.value.filePath);
    });

  if (choiceAbleTypes.length <= 0) {
    throw new Error('Cannot found interface or type-alias on typescript source file');
  }

  if (choiceAbleTypes.length === 1) {
    const autoSelectedIdentifier = first(choiceAbleTypes).value.identifier;
    log.info(
      `${chalk.green(
        '?',
      )} Select type(interface or type alias) for JSONSchema extraction:  ${chalk.cyan(
        autoSelectedIdentifier,
      )}`,
    );

    const firstTypeItem = first(choiceAbleTypes);

    return [{ filePath: firstTypeItem.value.filePath, typeName: firstTypeItem.value.identifier }];
  }

  // single file select ui
  if (isMultipleSelect === false) {
    inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

    const fuse = new Fuse(choiceAbleTypes, {
      includeScore: true,
      keys: ['identifier', 'filePath'],
    });

    const answer = await inquirer.prompt<
      Omit<IPromptAnswerSelectType, 'typeName'> & { typeName: IChoiceTypeItem }
    >([
      {
        type: 'autocomplete',
        name: 'typeName',
        pageSize: 20,
        message: 'Select type(interface or type alias) for JSONSchema extraction: ',
        source: (_answersSoFar: any, input: string) => {
          const safeInput = input == null ? '' : input;

          if (safeInput === '') {
            return new Promise((resolve) => {
              resolve(choiceAbleTypes);
            });
          }

          return new Promise((resolve) => {
            const fused = fuse
              .search(safeInput)
              .map((matched) => {
                return {
                  ...matched,
                  oneBased: getRatioNumber(matched.score ?? 0),
                  percent: getRatioNumber(matched.score ?? 0, 100),
                };
              })
              .filter((matched) => matched.percent >= CE_FUZZY_SCORE_LIMIT.TYPE_CHOICE_FUZZY)
              .sort((l, r) => r.percent - l.percent)
              .map((matched) => matched.item);

            resolve(fused);
          });
        },
      },
    ]);

    return [{ filePath: answer.typeName.filePath, typeName: answer.typeName.identifier }];
  }

  // multiple, searchable checkbox ui
  inquirer.registerPrompt('checkbox-plus', CheckboxPlusPrompt);

  const fuse = new Fuse(choiceAbleTypes, {
    includeScore: true,
    keys: ['identifier', 'filePath'],
  });

  const answer = await inquirer.prompt<
    Omit<IPromptAnswerSelectType, 'typeName'> & { typeName: IChoiceTypeItem[] }
  >([
    {
      type: 'checkbox-plus',
      name: 'typeName',
      pageSize: 20,
      highlight: true,
      searchable: true,
      default: choiceAbleTypes.map((choiceAbleType) => choiceAbleType.value),
      message: 'Select type(interface or type alias) for JSONSchema extraction: ',
      validate(tsFilesAnswer: string[]) {
        if (tsFilesAnswer.length === 0) {
          return 'You must choose at least one type in source code files.';
        }

        return true;
      },
      source: (_answersSoFar: any, input: string) => {
        const safeInput = input == null ? '' : input;

        if (safeInput === '') {
          return new Promise((resolve) => {
            resolve(choiceAbleTypes);
          });
        }

        return new Promise((resolve) => {
          const fused = fuse
            .search(safeInput)
            .map((matched) => {
              return {
                ...matched,
                oneBased: getRatioNumber(matched.score ?? 0),
                percent: getRatioNumber(matched.score ?? 0, 100),
              };
            })
            .filter((matched) => matched.percent >= CE_FUZZY_SCORE_LIMIT.TYPE_CHOICE_FUZZY)
            .sort((l, r) => r.percent - l.percent)
            .map((matched) => matched.item);

          resolve(fused);
        });
      },
    },
  ]);

  return answer.typeName.map((typeName) => {
    return { filePath: typeName.filePath, typeName: typeName.identifier };
  });
}
