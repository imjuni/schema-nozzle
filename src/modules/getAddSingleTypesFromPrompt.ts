import { CE_FUZZY_SCORE_LIMIT } from '#modules/interfaces/CE_FUZZY_SCORE_LIMIT';
import getRatioNumber from '#tools/getRatioNumber';
import Fuse from 'fuse.js';
import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import type { LastArrayElement } from 'type-fest';

export default async function getAddSingleTypesFromPrompt(
  exportedTypes: { filePath: string; identifier: string }[],
): Promise<typeof exportedTypes> {
  const promptItems = exportedTypes.map((exportedType) => ({
    name: `${exportedType.identifier} - ${exportedType.filePath}`,
    value: exportedType,
  }));

  // single file select ui
  inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

  const fuse = new Fuse(promptItems, {
    includeScore: true,
    keys: ['value.identifier', 'value.filePath'],
  });

  const answer = await inquirer.prompt<{ identifier: LastArrayElement<typeof exportedTypes> }>([
    {
      type: 'autocomplete',
      name: 'identifier',
      pageSize: 20,
      message: 'Select type(interface or type alias) for JSONSchema extraction: ',
      source: (_answersSoFar: any, input?: string) => {
        const safeInput = input == null ? '' : input;

        if (safeInput === '') {
          return Promise.resolve(promptItems);
        }

        return new Promise((resolve) => {
          const fused = fuse
            .search(safeInput)
            .map((matched) => ({ ...matched, percent: getRatioNumber(matched.score ?? 0, 100) }))
            .filter((matched) => matched.percent >= CE_FUZZY_SCORE_LIMIT.TYPE_CHOICE_FUZZY)
            .sort((l, r) => r.percent - l.percent)
            .map((matched) => matched.item);

          resolve(fused);
        });
      },
    },
  ]);

  return [answer.identifier];
}
