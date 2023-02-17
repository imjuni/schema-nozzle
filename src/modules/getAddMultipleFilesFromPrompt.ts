import { CE_FUZZY_SCORE_LIMIT } from '#modules/interfaces/CE_FUZZY_SCORE_LIMIT';
import getRatioNumber from '#tools/getRatioNumber';
import logger from '#tools/logger';
import Fuse from 'fuse.js';
import inquirer from 'inquirer';
import { CheckboxPlusPrompt } from 'inquirer-ts-checkbox-plus-prompt';

const log = logger();

export default async function getAddMultipleFilesFromPrompt(
  schemaFiles: { origin: string; refined: string }[],
): Promise<typeof schemaFiles> {
  try {
    // multiple, searchable checkbox ui
    inquirer.registerPrompt('checkbox-plus', CheckboxPlusPrompt);

    const promptItems = schemaFiles.map((schemaFile) => ({
      name: `${schemaFile.refined} - ${schemaFile.origin}`,
      value: schemaFile,
    }));

    const fuse = new Fuse(promptItems, {
      includeScore: true,
      keys: ['value.origin', 'value.refiend'],
    });

    const answer = await inquirer.prompt<{ schemaFiles: typeof schemaFiles }>([
      {
        type: 'checkbox-plus',
        name: 'schemaFiles',
        pageSize: 20,
        highlight: true,
        searchable: true,
        message: 'Select file for JSONSchema extraction: ',
        validate(tsFilesAnswer: string[]) {
          if (tsFilesAnswer.length === 0) {
            return 'You must choose at least one typescript source code file.';
          }

          return true;
        },
        source(_answersSoFar: any, input: string | undefined) {
          const safeInput = input == null ? '' : input;

          if (safeInput === '') {
            return Promise.resolve(promptItems);
          }

          return new Promise((resolve) => {
            const fused = fuse
              .search(safeInput)
              .map((matched) => ({ ...matched, percent: getRatioNumber(matched.score ?? 0, 100) }))
              .filter((matched) => matched.percent >= CE_FUZZY_SCORE_LIMIT.FILE_CHOICE_FUZZY)
              .sort((l, r) => r.percent - l.percent)
              .map((matched) => matched.item);

            resolve(fused);
          });
        },
      },
    ]);

    return answer.schemaFiles;
  } catch (caught) {
    log.trace(caught);

    throw caught;
  }
}