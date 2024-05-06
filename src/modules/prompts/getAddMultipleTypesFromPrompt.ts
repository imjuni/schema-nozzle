import type { ISimpleExportedDeclaration } from '#/modules/cli/interfaces/ISimpleExportedDeclaration';
import { CE_FUZZY_SCORE_LIMIT } from '#/modules/const-enum/CE_FUZZY_SCORE_LIMIT';
import { getRatioNumber } from '#/tools/getRatioNumber';
import { getRelativeCwd } from '#/tools/getRelativeCwd';
import Fuse from 'fuse.js';
import inquirer from 'inquirer';
import { CheckboxPlusPrompt } from 'inquirer-ts-checkbox-plus-prompt';

export async function getAddMultipleTypesFromPrompt(
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

  // multiple, searchable checkbox ui
  inquirer.registerPrompt('checkbox-plus', CheckboxPlusPrompt);

  const fuse = new Fuse(promptItems, {
    includeScore: true,
    keys: ['value.identifier', 'value.filePath'],
  });

  const answer = await inquirer.prompt<{ identifiers: typeof exportedTypes }>([
    {
      type: 'checkbox-plus',
      name: 'identifiers',
      pageSize: 20,
      highlight: true,
      searchable: true,
      default: promptItems.map((item) => item.value),
      message: 'Select type(interface or type alias) for JSONSchema extraction: ',
      validate(tsFilesAnswer: string[]) {
        if (tsFilesAnswer.length === 0) {
          return 'You must choose at least one type in source code files.';
        }

        return true;
      },
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

  return answer.identifiers;
}
