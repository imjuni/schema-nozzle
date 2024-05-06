import type { ISimpleExportedDeclaration } from '#/modules/cli/interfaces/ISimpleExportedDeclaration';
import { CE_FUZZY_SCORE_LIMIT } from '#/modules/const-enum/CE_FUZZY_SCORE_LIMIT';
import { getRatioNumber } from '#/tools/getRatioNumber';
import { getRelativeCwd } from '#/tools/getRelativeCwd';
import Fuse from 'fuse.js';
import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import type { LastArrayElement } from 'type-fest';

export async function getAddSingleTypesFromPrompt(
  cwd: string,
  exportedTypes: ISimpleExportedDeclaration[],
): Promise<typeof exportedTypes> {
  const promptItems = exportedTypes.map((exportedType) => {
    const relative = getRelativeCwd(cwd, exportedType.filePath);
    return {
      name: `${exportedType.typeName} - ${relative}`,
      value: { ...exportedType, relative },
    };
  });

  // single file select ui
  inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

  const fuse = new Fuse(promptItems, {
    includeScore: true,
    keys: ['value.identifier'],
  });

  const answer = await inquirer.prompt<{ identifier: LastArrayElement<typeof exportedTypes> }>([
    {
      type: 'autocomplete',
      name: 'identifier',
      pageSize: 20,
      message: 'Select type(interface or type alias) for JSONSchema extraction: ',
      source: (_answersSoFar: unknown, input?: string) => {
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
