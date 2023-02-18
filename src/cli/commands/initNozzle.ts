import spinner from '#cli/display/spinner';
import getInitialOption from '#configs/getInitialOption';
import { CE_DEFAULT_VALUE } from '#configs/interfaces/CE_DEFAULT_VALUE';
import type IInitOption from '#configs/interfaces/IInitOption';
import getCwd from '#tools/getCwd';
import logger from '#tools/logger';
import fastGlob from 'fast-glob';
import fs from 'fs/promises';
import inquirer from 'inquirer';
import { parse } from 'jsonc-parser';
import { getDirname } from 'my-node-fp';
import path from 'path';

const log = logger();

export default async function initNozzle(_option: IInitOption) {
  const cwd = getCwd(process.env);
  const tsconfigFilePaths = await fastGlob('**/tsconfig.json', { cwd, ignore: ['node_modules'] });

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
    any
  >;

  spinner.start(`create ${CE_DEFAULT_VALUE.CONFIG_FILE_NAME}, ...`);

  const projectRootDir = await getDirname(answer.tsconfigFilePath);

  const outputFilePath = path.join(projectRootDir, CE_DEFAULT_VALUE.DB_FILE_NAME);
  const listFileFilePath = path.join(projectRootDir, CE_DEFAULT_VALUE.LIST_FILE);
  const configFilePath = path.join(projectRootDir, CE_DEFAULT_VALUE.CONFIG_FILE_NAME);

  await fs.writeFile(
    configFilePath,
    getInitialOption(outputFilePath, answer.tsconfigFilePath, listFileFilePath),
  );

  spinner.update({
    message: `create ${CE_DEFAULT_VALUE.CONFIG_FILE_NAME}: ${configFilePath}`,
    channel: 'succeed',
  });

  spinner.start(`create ${CE_DEFAULT_VALUE.LIST_FILE}, ...`);

  const nozzlefiles = tsconfig.include != null ? (tsconfig.include as string[]) : ['**/*.ts'];
  await fs.writeFile(listFileFilePath, `${nozzlefiles.join('\n')}\n`);

  spinner.update({
    message: `create ${CE_DEFAULT_VALUE.LIST_FILE}: ${listFileFilePath}`,
    channel: 'succeed',
  });

  log.trace(answer.tsconfigFilePath);
}
