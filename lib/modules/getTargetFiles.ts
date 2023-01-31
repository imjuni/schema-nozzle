import { CE_DEFAULT_VALUE } from '#configs/interfaces/CE_DEFAULT_VALUE';
import type IBaseOption from '#configs/interfaces/IBaseOption';
import getCwd from '#tools/getCwd';
import fs from 'fs';
import ignore from 'ignore';
import { exists } from 'my-node-fp';
import path from 'path';
import type { SetOptional } from 'type-fest';

export async function getTargetFilePath(filename?: string) {
  if (filename != null && (await exists(path.resolve(filename)))) {
    return path.resolve(filename);
  }

  const defaultValue = path.resolve(path.join(getCwd(process.env), CE_DEFAULT_VALUE.LIST_FILE));
  if (await exists(defaultValue)) {
    return defaultValue;
  }

  return undefined;
}

export async function getTargetFileContent(filePath: string) {
  return (await fs.promises.readFile(filePath))
    .toString()
    .split('\n')
    .map((line) => line.trim());
}

export async function getTargetFiles(
  option: SetOptional<Pick<IBaseOption, 'listFile'>, 'listFile'>,
) {
  const ig = ignore();
  const filePath = await getTargetFilePath(option.listFile);

  if (filePath === undefined) {
    return ig;
  }

  const lines = await getTargetFileContent(filePath);
  ig.add(lines);

  return ig;
}
