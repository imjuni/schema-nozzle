import IPromptAnswerSelectFile from '@cli/interfaces/IPromptAnswerSelectFile';
import IResolvedPaths from '@configs/interfaces/IResolvedPaths';
import { TFUZZY_SCORE_LIMIT } from '@modules/interfaces/TFUZZY_SCORE_LIMIT';
import posixJoin from '@tools/posixJoin';
import fastGlob from 'fast-glob';
import { exists } from 'find-up';
import Fuse from 'fuse.js';
import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import { CheckboxPlusPrompt } from 'inquirer-ts-checkbox-plus-prompt';
import { bignumber } from 'mathjs';
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

  const fuse = new Fuse(files, { includeScore: true });

  if (isMultipleSelect === true) {
    inquirer.registerPrompt('checkbox-plus', CheckboxPlusPrompt);

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
              .filter((matched) => matched.percent > TFUZZY_SCORE_LIMIT.FILE_CHOICE_FUZZY)
              .sort((l, r) => r.percent - l.percent)
              .map((matched) => matched.item);

            resolve(fused);
          });
        },
      },
    ]);

    const tsFiles = await Promise.all(
      answer.tsFile.map(async (tsFile) => {
        const tsFilePath = await getFilePath(
          posixJoin(resolvedPaths.cwd, tsFile),
          resolvedPaths.cwd,
        );

        return tsFilePath;
      }),
    );

    return tsFiles;
  }

  inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

  if (files.length <= 0) {
    throw new Error(`Cannot found typescript source files: ${resolvedPaths.cwd}`);
  }

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
          .filter((matched) => matched.percent > TFUZZY_SCORE_LIMIT.FILE_CHOICE_FUZZY)
          .sort((l, r) => r.percent - l.percent)
          .map((matched) => matched.item);
      },
    },
  ]);

  return [await getFilePath(posixJoin(resolvedPaths.cwd, answer.tsFile), resolvedPaths.cwd)];
}
