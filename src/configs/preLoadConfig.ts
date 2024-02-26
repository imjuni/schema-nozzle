import { CE_COMMAND_LIST } from '#/cli/interfaces/CE_COMMAND_LIST';
import { CE_DEFAULT_VALUE } from '#/configs/interfaces/CE_DEFAULT_VALUE';
import type IInitOption from '#/configs/interfaces/IInitOption';
import type TAddSchemaOption from '#/configs/interfaces/TAddSchemaOption';
import type TDeleteSchemaOption from '#/configs/interfaces/TDeleteSchemaOption';
import type TRefreshSchemaOption from '#/configs/interfaces/TRefreshSchemaOption';
import type TTruncateSchemaOption from '#/configs/interfaces/TTruncateSchemaOption';
import getCwd from '#/tools/getCwd';
import consola from 'consola';
import findUp from 'find-up';
import fs from 'fs';
import { parse } from 'jsonc-parser';
import minimist from 'minimist';
import { atOrThrow, atOrUndefined, isError, toArray } from 'my-easy-fp';
import { existsSync, getDirnameSync } from 'my-node-fp';

function getConfigObject(configFilePath: string): Record<string, string | undefined> {
  if (existsSync(configFilePath) === false) {
    return {};
  }

  const configBuf = fs.readFileSync(configFilePath);
  const configObj = parse(configBuf.toString()) as Record<string, string | undefined>;

  return configObj;
}

function getDiscriminator(
  command: string,
):
  | TAddSchemaOption['discriminator']
  | TRefreshSchemaOption['discriminator']
  | TDeleteSchemaOption['discriminator']
  | TTruncateSchemaOption['discriminator']
  | IInitOption['discriminator'] {
  if (command === CE_COMMAND_LIST.REFRESH || command === CE_COMMAND_LIST.REFRESH_ALIAS) {
    return 'refresh-schema';
  }

  if (command === CE_COMMAND_LIST.DEL || command === CE_COMMAND_LIST.DEL_ALIAS) {
    return 'delete-schema';
  }

  if (command === CE_COMMAND_LIST.TRUNCATE || command === CE_COMMAND_LIST.TRUNCATE_ALIAS) {
    return 'truncate-schema';
  }

  if (command === CE_COMMAND_LIST.INIT || command === CE_COMMAND_LIST.INIT_ALIAS) {
    return 'init-nozzle';
  }

  return 'add-schema';
}

export default function preLoadConfig() {
  try {
    const cwd = getCwd(process.env);
    const argv = minimist(process.argv.slice(2));
    const configFilePath =
      argv.config != null || argv.c != null
        ? findUp.sync([argv.config, argv.c], { cwd })
        : findUp.sync(CE_DEFAULT_VALUE.CONFIG_FILE_NAME, { cwd });
    const tsconfigPath =
      argv.project != null || argv.p != null
        ? findUp.sync([argv.project, argv.p], { cwd })
        : findUp.sync(CE_DEFAULT_VALUE.TSCONFIG_FILE_NAME, { cwd });

    if (atOrUndefined(toArray(argv._), 0) == null) {
      return {};
    }

    const discriminator = getDiscriminator(atOrThrow(toArray(argv._), 0));

    if (configFilePath != null) {
      const configObj = getConfigObject(configFilePath);

      return {
        ...configObj,
        p: configObj.p ?? configObj.project ?? tsconfigPath,
        project: configObj.p ?? configObj.project ?? tsconfigPath,
        c: configFilePath,
        config: configFilePath,
        discriminator,
      };
    }

    if (tsconfigPath != null) {
      const alternativeConfigPath = findUp.sync(CE_DEFAULT_VALUE.CONFIG_FILE_NAME, {
        cwd: getDirnameSync(tsconfigPath),
      });

      if (alternativeConfigPath != null) {
        const configObj = getConfigObject(alternativeConfigPath);

        return {
          ...configObj,
          p: configObj.p ?? configObj.project ?? tsconfigPath,
          project: configObj.p ?? configObj.project ?? tsconfigPath,
          c: configFilePath,
          config: configFilePath,
          discriminator,
        };
      }

      return {
        p: tsconfigPath,
        project: tsconfigPath,
        discriminator,
      };
    }

    return {};
  } catch (caught) {
    const err = isError(caught, new Error('unknown error raised'));

    consola.error(err);
    consola.error(err.stack);

    return {};
  }
}
