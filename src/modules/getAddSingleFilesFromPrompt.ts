import { CE_FUZZY_SCORE_LIMIT } from '#modules/interfaces/CE_FUZZY_SCORE_LIMIT';
import getRatioNumber from '#tools/getRatioNumber';
import Fuse from 'fuse.js';
import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import path from 'path';
import type { LastArrayElement } from 'type-fest';

// single file select ui
export default async function getAddSingleFilesFromPrompt(
  schemaFiles: { origin: string; refined: string }[],
): Promise<LastArrayElement<typeof schemaFiles>[]> {
  inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

  const promptItems = schemaFiles.map((schemaFile) => {
    const basename = path.basename(schemaFile.origin);
    return {
      name: `${basename} - ${schemaFile.refined}`,
      value: { ...schemaFile, search: basename },
    };
  });

  const fuse = new Fuse(promptItems, {
    includeScore: true,
    keys: ['value.search'],
  });

  const answer = await inquirer.prompt<{ schemaFile: LastArrayElement<typeof schemaFiles> }>([
    {
      type: 'autocomplete',
      name: 'schemaFile',
      pageSize: 20,
      message: 'Select file for JSONSchema extraction: ',
      source: (_answersSoFar: unknown, input: string | undefined) => {
        const safeInput = input == null ? '' : input;

        if (safeInput === '') {
          return Promise.resolve(promptItems);
        }

        return fuse
          .search(safeInput)
          .map((matched) => ({ ...matched, percent: getRatioNumber(matched.score ?? 0, 100) }))
          .filter((matched) => matched.percent > CE_FUZZY_SCORE_LIMIT.FILE_CHOICE_FUZZY)
          .sort((l, r) => r.percent - l.percent)
          .map((matched) => matched.item);
      },
    },
  ]);

  return [answer.schemaFile];
}
