import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import { TNullableDatabase } from '@modules/interfaces/TDatabase';
import Fuse from 'fuse.js';
import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import { bignumber } from 'mathjs';

interface IGetTypesFromPrompt {
  db: TNullableDatabase;
  useListUI: boolean;
}

const fuzzyLimit = 40;

export default async function getDeleteTypesFromPrompt({
  db,
  useListUI,
}: IGetTypesFromPrompt): Promise<string[]> {
  const choiceAbleTypes = Object.entries(db)
    .map(([key, value]) => ({ key, value }))
    .filter((entry): entry is { key: string; value: IDatabaseRecord } => entry.value != null)
    .map((entry) => {
      return entry.value.id;
    });

  if (choiceAbleTypes.length <= 0) {
    throw new Error('Cannot found interface or type-alias on typescript source file');
  }

  if (useListUI === true) {
    const answer = await inquirer.prompt<{ typeName: string }>([
      {
        type: 'list',
        name: 'typeName',
        pageSize: 20,
        message: 'Select type(interface or type alias) for JSONSchema extraction: ',
        choices: choiceAbleTypes,
      },
    ]);

    return [answer.typeName];
  }

  inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

  const fuse = new Fuse(choiceAbleTypes, { includeScore: true });

  const answer = await inquirer.prompt<{ typeName: string }>([
    {
      type: 'autocomplete',
      name: 'typeName',
      pageSize: 20,
      message: 'Select type(interface or type alias) for JSONSchema extraction: ',
      source: (_answersSoFar: any, input: string | undefined) => {
        const safeInput = input === undefined || input === null ? '' : input;

        return fuse
          .search(safeInput)
          .map((matched) => {
            return {
              ...matched,
              oneBased: bignumber(1)
                .sub(bignumber(matched.score ?? 0))
                .mul(100)
                .floor()
                .div(100)
                .toNumber(),
              percent: bignumber(1)
                .sub(bignumber(matched.score ?? 0))
                .mul(10000)
                .floor()
                .div(100)
                .toNumber(),
            };
          })
          .filter((matched) => matched.percent > fuzzyLimit)
          .sort((l, r) => r.percent - l.percent)
          .map((matched) => matched.item);
      },
    },
  ]);

  return [answer.typeName];
}
