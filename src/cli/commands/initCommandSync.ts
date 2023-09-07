import fastGlob from 'fast-glob';
import inquirer from 'inquirer';
import { parse } from 'jsonc-parser';
import { getDirname } from 'my-node-fp';
import fs from 'node:fs/promises';
import path from 'node:path';
import spinner from 'src/cli/display/spinner';
import getInitialOption from 'src/configs/getInitialOption';
import { CE_DEFAULT_VALUE } from 'src/configs/interfaces/CE_DEFAULT_VALUE';
import type IInitOption from 'src/configs/interfaces/IInitOption';
import getCwd from 'src/tools/getCwd';
import logger from 'src/tools/logger';

const log = logger();

export default async function initCommandSync(_option: IInitOption) {
  const cwd = getCwd(process.env);
  const tsconfigFilePaths = await fastGlob(['**/tsconfig.json', '**/tsconfig.*.json'], {
    cwd,
    ignore: ['node_modules'],
  });

  log.trace('tsconfig file: %s', tsconfigFilePaths);

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

  const tsconfig = parse((await fs.readFile(answer.tsconfigFilePath)).toString()) as Record<
    string,
    unknown
  >;

  spinner.start(`create ${CE_DEFAULT_VALUE.CONFIG_FILE_NAME}, ...`);

  const projectRootDir = await getDirname(answer.tsconfigFilePath);

  const outputFilePath = path.join(projectRootDir, CE_DEFAULT_VALUE.DB_FILE_NAME);
  const listFileFilePath = path.join(projectRootDir, CE_DEFAULT_VALUE.LIST_FILE_NAME);
  const configFilePath = path.join(projectRootDir, CE_DEFAULT_VALUE.CONFIG_FILE_NAME);

  await fs.writeFile(
    configFilePath,
    getInitialOption(outputFilePath, answer.tsconfigFilePath, listFileFilePath),
  );

  spinner.stop(`create ${CE_DEFAULT_VALUE.CONFIG_FILE_NAME}: ${configFilePath}`, 'succeed');

  spinner.start(`create ${CE_DEFAULT_VALUE.LIST_FILE_NAME}, ...`);

  const nozzlefiles = tsconfig.include != null ? (tsconfig.include as string[]) : ['**/*.ts'];
  await fs.writeFile(listFileFilePath, `${nozzlefiles.join('\n')}\n`);

  spinner.stop(`create ${CE_DEFAULT_VALUE.LIST_FILE_NAME}: ${listFileFilePath}`, 'succeed');

  log.trace(answer.tsconfigFilePath);
}
