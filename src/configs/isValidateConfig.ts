import { CE_COMMAND_LIST } from '#/cli/interfaces/CE_COMMAND_LIST';
import type { IInitOption } from '#/configs/interfaces/IInitOption';
import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { TTruncateSchemaOption } from '#/configs/interfaces/TTruncateSchemaOption';
import type { TWatchSchemaOption } from '#/configs/interfaces/TWatchSchemaOption';
import consola from 'consola';
import { existsSync } from 'my-node-fp';
import pathe from 'pathe';
import type { Arguments } from 'yargs';

const commands: string[] = [
  CE_COMMAND_LIST.ADD,
  CE_COMMAND_LIST.ADD_ALIAS,
  CE_COMMAND_LIST.DEL,
  CE_COMMAND_LIST.DEL_ALIAS,
  CE_COMMAND_LIST.REFRESH,
  CE_COMMAND_LIST.REFRESH_ALIAS,
  CE_COMMAND_LIST.TRUNCATE,
  CE_COMMAND_LIST.TRUNCATE_ALIAS,
  CE_COMMAND_LIST.INIT,
  CE_COMMAND_LIST.INIT_ALIAS,
];

export function isValidateConfig<
  T extends
    | TDeleteSchemaOption
    | TAddSchemaOption
    | TTruncateSchemaOption
    | TRefreshSchemaOption
    | TWatchSchemaOption
    | IInitOption,
>(argv: T) {
  const [command] = (argv as unknown as Arguments<T>)._;

  if (commands.includes(`${command ?? ''}`) === false) {
    throw new Error(`"${command ?? ''}" is invalid command`);
  }

  if (command === CE_COMMAND_LIST.INIT || command === CE_COMMAND_LIST.INIT_ALIAS) {
    return true;
  }

  if (argv.$kind === 'init-nozzle') {
    return true;
  }

  const { project } = argv;
  const resolvedProject = pathe.isAbsolute(project) ? project : pathe.resolve(project);

  if (existsSync(resolvedProject) === false) {
    consola.error(`Cannot found project: ${resolvedProject}`);
    throw new Error(`Cannot found project: ${resolvedProject}`);
  }

  if ('files' in argv && argv.files.length > 0) {
    const files = argv.files.map((file) => ({ file, exists: existsSync(file) }));
    const notExistFiles = files.filter((file) => file.exists === false);
    consola.error(`Cannot found files: ${notExistFiles.map((file) => file.file).join(', ')}`);
    throw new Error(`Cannot found files: ${notExistFiles.map((file) => file.file).join(', ')}`);
  }

  return true;
}
