import { CE_DEFAULT_VALUE } from '#/configs/interfaces/CE_DEFAULT_VALUE';
import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { TWatchSchemaOption } from '#/configs/interfaces/TWatchSchemaOption';
import { isDirectory } from 'my-node-fp';
import path from 'path';

export async function getDatabaseFilePath(
  option:
    | Pick<TWatchSchemaOption, 'output'>
    | Pick<TRefreshSchemaOption, 'output'>
    | Pick<TAddSchemaOption, 'output'>,
): Promise<string> {
  const dbPath = (await isDirectory(option.output))
    ? path.join(option.output, CE_DEFAULT_VALUE.DB_FILE_NAME)
    : option.output;

  return dbPath;
}
