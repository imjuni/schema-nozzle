import { CE_DEFAULT_VALUE } from '#configs/interfaces/CE_DEFAULT_VALUE';
import getCwd from '#tools/getCwd';
import logger from '#tools/logger';
import findUp from 'find-up';
import fs from 'fs';
import { parse } from 'jsonc-parser';
import minimist from 'minimist';
import { isError } from 'my-easy-fp';
import { existsSync, getDirnameSync } from 'my-node-fp';

const log = logger();

function getConfigObject(configFilePath: string): Record<string, string | undefined> {
  if (existsSync(configFilePath) === false) {
    return {};
  }

  const configBuf = fs.readFileSync(configFilePath);
  const configObj = parse(configBuf.toString()) as Record<string, string | undefined>;

  return configObj;
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

    if (configFilePath != null) {
      const configObj = getConfigObject(configFilePath);

      return {
        ...configObj,
        p: configObj.p ?? configObj.project ?? tsconfigPath,
        project: configObj.p ?? configObj.project ?? tsconfigPath,
        c: configFilePath,
        config: configFilePath,
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
        };
      }

      return {
        p: tsconfigPath,
        project: tsconfigPath,
      };
    }

    return {};
  } catch (caught) {
    const err = isError(caught, new Error('unknown error raised'));

    log.error(err);
    log.error(err.stack);

    return {};
  }
}
