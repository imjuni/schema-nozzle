import { spinner } from '#/cli/display/spinner';
import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import { getInitialOption } from '#/configs/getInitialOption';
import type { IInitOption } from '#/configs/interfaces/IInitOption';
import { getCwd } from '#/tools/getCwd';
import consola from 'consola';
import fastGlob from 'fast-glob';
import inquirer from 'inquirer';
import { getDirname } from 'my-node-fp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getTypeScriptConfig } from 'ts-morph-short';

export async function initCommandSync(_option: IInitOption) {
  const cwd = getCwd(process.env);
  const tsconfigFilePaths = await fastGlob(['**/tsconfig.json', '**/tsconfig.*.json'], {
    cwd,
    ignore: ['node_modules'],
  });

  consola.trace('tsconfig file: %s', tsconfigFilePaths);

  const answer = await inquirer.prompt<{
    tsconfigFilePath: string;
  }>([
    {
      type: 'list',
      name: 'tsconfigFilePath',
      message: 'Select your tsconfig.json file: ',
      choices: tsconfigFilePaths,
    },
  ]);

  const { tsconfigFilePath } = answer;
  const tsconfigDirPath = await getDirname(answer.tsconfigFilePath);

  const tsconfig = getTypeScriptConfig(tsconfigFilePath);

  spinner.start(`create ${CE_DEFAULT_VALUE.CONFIG_FILE_NAME}, ...`);

  const outputFilePath = path.relative(
    tsconfigDirPath,
    path.resolve(path.join(tsconfigDirPath, CE_DEFAULT_VALUE.DB_FILE_NAME)),
  );
  const configFilePath = path.resolve(
    path.join(tsconfigDirPath, CE_DEFAULT_VALUE.CONFIG_FILE_NAME),
  );

  await fs.writeFile(
    configFilePath,
    getInitialOption(
      outputFilePath,
      path.relative(tsconfigDirPath, tsconfigFilePath),
      tsconfig.raw.include ?? [],
    ),
  );

  spinner.stop(`create ${CE_DEFAULT_VALUE.CONFIG_FILE_NAME}: ${configFilePath}`, 'succeed');

  consola.trace(answer.tsconfigFilePath);
}
