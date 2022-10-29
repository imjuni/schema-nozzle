import logger from '@tools/logger';
import findUp from 'find-up';
import fs from 'fs';
import { parse } from 'jsonc-parser';
import minimist from 'minimist';
import { existsSync, getDirnameSync } from 'my-node-fp';

const log = logger();

const configFileName = '.ctjsrc';
const tsconfigFileName = 'tsconfig.json';

function getConfigObject(configFilePath: string): any {
  if (existsSync(configFilePath) === false) {
    return {};
  }

  const configBuf = fs.readFileSync(configFilePath);
  const configObj = parse(configBuf.toString());
  return configObj;
}

export default function preLoadConfig() {
  try {
    const argv = minimist(process.argv.slice(2));
    const configFilePath =
      argv.config != null || argv.c != null
        ? findUp.sync([argv.config, argv.c])
        : findUp.sync(configFileName);
    const tsconfigPath =
      argv.project != null || argv.p != null
        ? findUp.sync([argv.project, argv.p])
        : findUp.sync(tsconfigFileName);

    if (configFilePath != null && tsconfigPath != null) {
      const configObj = getConfigObject(configFilePath);

      return {
        ...configObj,
        p: configObj.p ?? configObj.project ?? tsconfigPath,
        project: configObj.p ?? configObj.project ?? tsconfigPath,
        c: configFilePath,
        config: configFilePath,
      };
    }

    if (configFilePath != null && tsconfigPath == null) {
      const configObj = getConfigObject(configFilePath);
      return { ...configObj, c: configFilePath, config: configFilePath };
    }

    if (configFilePath == null && tsconfigPath != null) {
      const alternativeConfigPath = findUp.sync(configFileName, {
        cwd: getDirnameSync(tsconfigPath),
      });

      if (alternativeConfigPath != null) {
        const configObj = getConfigObject(alternativeConfigPath);

        return {
          ...configObj,
          p: tsconfigPath,
          project: tsconfigPath,
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
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');

    log.error(err);
    log.error(err.stack);

    return {};
  }
}
