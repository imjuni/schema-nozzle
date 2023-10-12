import { CE_DEFAULT_VALUE } from '#/configs/interfaces/CE_DEFAULT_VALUE';
import type TWatchSchemaOption from '#/configs/interfaces/TWatchSchemaOption';
import getDatabaseFilePath from '#/databases/getDatabaseFilePath';
import getSchemaFileContent from '#/modules/getSchemaFileContent';
import getSchemaFilterFilePath from '#/modules/getSchemaFilterFilePath';
import logger from '#/tools/logger';
import ignore from 'ignore';

const log = logger();

export default async function getWatchFiles(
  filePaths: { origin: string; refined: string }[],
  option: Pick<TWatchSchemaOption, 'project' | 'listFile' | 'cwd' | 'output'>,
): Promise<string[]> {
  try {
    log.trace(filePaths.map((f) => `${f.origin} ${f.refined}`).join(', '));

    const dbPath = await getDatabaseFilePath(option);

    const schemaFilterFilePath = await getSchemaFilterFilePath(option.cwd, option.listFile);

    if (schemaFilterFilePath == null) {
      return filePaths
        .filter((filePath) => filePath.origin !== dbPath)
        .map((filePath) => filePath.origin);
    }

    const listFileFilter = ignore().add(await getSchemaFileContent(schemaFilterFilePath));

    const targetFilePaths = filePaths.filter((filePath) =>
      listFileFilter.ignores(filePath.refined),
    );

    return targetFilePaths.map((filePath) => filePath.origin);
  } catch {
    return [CE_DEFAULT_VALUE.WATCH_DEFAULT_GLOB];
  }
}
