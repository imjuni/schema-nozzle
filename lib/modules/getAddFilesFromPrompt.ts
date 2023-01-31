import type IPromptAnswerSelectFile from '#cli/interfaces/IPromptAnswerSelectFile';
import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';
import { CE_FUZZY_SCORE_LIMIT } from '#modules/interfaces/CE_FUZZY_SCORE_LIMIT';
import getRatioNumber from '#tools/getRatioNumber';
import posixJoin from '#tools/posixJoin';
import fastGlob from 'fast-glob';
import { exists } from 'find-up';
import Fuse from 'fuse.js';
import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import { CheckboxPlusPrompt } from 'inquirer-ts-checkbox-plus-prompt';
import { replaceSepToPosix, win32DriveLetterUpdown } from 'my-node-fp';
import path from 'path';

const globPaths = ['**/*.ts', '**/*.mts', '**/*.cts', '**/*.tsx'];

async function getFilePath(filePath: string, cwd: string): Promise<string> {
  if ((await exists(path.resolve(filePath))) === true) {
    return replaceSepToPosix(win32DriveLetterUpdown(path.resolve(filePath), 'upper'));
  }

  const filePathWithCwd = path.join(cwd, filePath);

  return replaceSepToPosix(win32DriveLetterUpdown(path.resolve(filePathWithCwd), 'upper'));
}

export default async function getAddFilesFromPrompt(
  resolvedPaths: IResolvedPaths,
  isMultipleSelect: boolean,
): Promise<string[]> {
  const files = await fastGlob(globPaths, {
    cwd: resolvedPaths.cwd,
    ignore: ['node_modules', 'dist/**', 'artifact/**', '**/*.d.ts', '**/__test__', '**/__tests__'],
  });

  if (files.length <= 0) {
    throw new Error(`Cannot found typescript source files: ${resolvedPaths.cwd}`);
  }

  // single file select ui
  if (isMultipleSelect === false) {
    inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

    const fuse = new Fuse(files, { includeScore: true });

    const answer = await inquirer.prompt<IPromptAnswerSelectFile>([
      {
        type: 'autocomplete',
        name: 'tsFile',
        pageSize: 20,
        message: 'Select file for JSONSchema extraction: ',
        source: (_answersSoFar: any, input: string | undefined) => {
          const safeInput = input == null ? '' : input;

          if (safeInput === '') {
            return files;
          }

          return fuse
            .search(safeInput)
            .map((matched) => {
              return {
                ...matched,
                oneBased: getRatioNumber(matched.score ?? 0),
                percent: getRatioNumber(matched.score ?? 0, 100),
              };
            })
            .filter((matched) => matched.percent > CE_FUZZY_SCORE_LIMIT.FILE_CHOICE_FUZZY)
            .sort((l, r) => r.percent - l.percent)
            .map((matched) => matched.item);
        },
      },
    ]);

    const tsFilePath = await getFilePath(
      posixJoin(resolvedPaths.cwd, answer.tsFile),
      resolvedPaths.cwd,
    );

    return [tsFilePath];
  }

  // multiple, searchable checkbox ui
  inquirer.registerPrompt('checkbox-plus', CheckboxPlusPrompt);

  const fuse = new Fuse(files, { includeScore: true });

  const answer = await inquirer.prompt<
    Omit<IPromptAnswerSelectFile, 'tsFile'> & { tsFile: string[] }
  >([
    {
      type: 'checkbox-plus',
      name: 'tsFile',
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
          return new Promise((resolve) => {
            resolve(files);
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
            .filter((matched) => matched.percent >= CE_FUZZY_SCORE_LIMIT.FILE_CHOICE_FUZZY)
            .sort((l, r) => r.percent - l.percent)
            .map((matched) => matched.item);

          resolve(fused);
        });
      },
    },
  ]);

  const tsFiles = await Promise.all(
    answer.tsFile.map(async (tsFile) => {
      const tsFilePath = await getFilePath(posixJoin(resolvedPaths.cwd, tsFile), resolvedPaths.cwd);
      return tsFilePath;
    }),
  );

  return tsFiles;
}
