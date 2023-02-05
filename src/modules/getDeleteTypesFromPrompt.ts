import type IPromptAnswerSelectType from '#cli/interfaces/IPromptAnswerSelectType';
import { CE_FUZZY_SCORE_LIMIT } from '#modules/interfaces/CE_FUZZY_SCORE_LIMIT';
import type IDatabaseRecord from '#modules/interfaces/IDatabaseRecord';
import type { TNullableDatabase } from '#modules/interfaces/TDatabase';
import getRatioNumber from '#tools/getRatioNumber';
import Fuse from 'fuse.js';
import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import { CheckboxPlusPrompt } from 'inquirer-ts-checkbox-plus-prompt';

interface IGetTypesFromPrompt {
  db: TNullableDatabase;
  isMultipleSelect: boolean;
}

interface IChoiceTypeItem {
  filePath: string;
  identifier: string;
  name: string;
  value: string;
}

export default async function getDeleteTypesFromPrompt({
  db,
  isMultipleSelect,
}: IGetTypesFromPrompt): Promise<string[]> {
  const choiceAbleTypes: IChoiceTypeItem[] = Object.entries(db)
    .map(([key, value]) => ({ key, value }))
    .filter((entry): entry is { key: string; value: IDatabaseRecord } => entry.value != null)
    .map((entry) => {
      return {
        name: entry.value.id,
        identifier: entry.value.id,
        filePath: entry.value.filePath ?? 'external module',
        value: entry.value.id,
      };
    });

  if (choiceAbleTypes.length <= 0) {
    throw new Error(
      'Cannot found interface or type-alias on typescript source file: Database is empty',
    );
  }

  if (isMultipleSelect === false) {
    inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

    const fuse = new Fuse(choiceAbleTypes, {
      includeScore: true,
      keys: ['identifier', 'filePath'],
    });

    const answer = await inquirer.prompt<
      Omit<IPromptAnswerSelectType, 'typeName'> & { typeName: string }
    >([
      {
        type: 'autocomplete',
        name: 'typeName',
        pageSize: 20,
        message: 'Select type(interface or type alias) for delete from database: ',
        source(_answersSoFar: any, input: string) {
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
              .filter((matched) => matched.percent >= CE_FUZZY_SCORE_LIMIT.DELETE_TYPE_CHOICE_FUZZY)
              .sort((l, r) => r.percent - l.percent)
              .map((matched) => matched.item);

            resolve(fused);
          });
        },
      },
    ]);

    return [answer.typeName];
  }

  inquirer.registerPrompt('checkbox-plus', CheckboxPlusPrompt);

  const fuse = new Fuse(choiceAbleTypes, {
    includeScore: true,
    keys: ['identifier', 'filePath'],
  });

  const answer = await inquirer.prompt<
    Omit<IPromptAnswerSelectType, 'typeName'> & { typeName: string[] }
  >([
    {
      type: 'checkbox-plus',
      name: 'typeName',
      pageSize: 20,
      highlight: true,
      searchable: true,
      message: 'Select type(interface or type alias) for delete from database: ',
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
            .filter((matched) => matched.percent >= CE_FUZZY_SCORE_LIMIT.DELETE_TYPE_CHOICE_FUZZY)
            .sort((l, r) => r.percent - l.percent)
            .map((matched) => matched.item);

          resolve(fused);
        });
      },
    },
  ]);

  return answer.typeName;
}
