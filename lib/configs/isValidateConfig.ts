import { CE_COMMAND_LIST } from '@cli/interfaces/CE_COMMAND_LIST';
import type IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import type IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import type ITruncateSchemaOption from '@configs/interfaces/ITruncateSchemaOption';
import type TAddSchemaOption from '@configs/interfaces/TAddSchemaOption';
import logger from 'lib/tools/logger';
import { existsSync } from 'my-node-fp';
import path from 'path';
import type { ArgumentsCamelCase } from 'yargs';

const log = logger();
const commands: string[] = [
  CE_COMMAND_LIST.ADD,
  CE_COMMAND_LIST.ADD_ALIAS,
  CE_COMMAND_LIST.DEL,
  CE_COMMAND_LIST.DEL_ALIAS,
  CE_COMMAND_LIST.REFRESH,
  CE_COMMAND_LIST.REFRESH_ALIAS,
  CE_COMMAND_LIST.TRUNCATE,
  CE_COMMAND_LIST.TRUNCATE_ALIAS,
];

export default function isValidateConfig<
  T extends IDeleteSchemaOption | TAddSchemaOption | ITruncateSchemaOption | IRefreshSchemaOption,
>(argv: T) {
  const [command] = (argv as any as ArgumentsCamelCase<T>)._;

  if (commands.includes(`${command}`) === false) {
    throw new Error(`"${command}" is invalid command`);
  }

  const { project } = argv;
  const resolvedProject = path.isAbsolute(project) ? project : path.resolve(project);

  if (existsSync(resolvedProject) === false) {
    log.error(`Cannot found project: ${resolvedProject}`);
    throw new Error(`Cannot found project: ${resolvedProject}`);
  }

  if ('files' in argv && argv.files != null && argv.files.length > 0) {
    const files = argv.files.map((file) => ({ file, exists: existsSync(file) }));
    const notExistFiles = files.filter((file) => file.exists === false);
    log.error(`Cannot found files: ${notExistFiles.map((file) => file.file).join(', ')}`);
    throw new Error(`Cannot found files: ${notExistFiles.map((file) => file.file).join(', ')}`);
  }

  return true;
}
