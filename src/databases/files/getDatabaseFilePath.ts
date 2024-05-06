import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { TWatchSchemaOption } from '#/configs/interfaces/TWatchSchemaOption';
import { isDirectory } from 'my-node-fp';
import pathe from 'pathe';

export async function getDatabaseFilePath(
  option:
    | Pick<TWatchSchemaOption, 'output'>
    | Pick<TRefreshSchemaOption, 'output'>
    | Pick<TAddSchemaOption, 'output'>,
): Promise<string> {
  const dbPath = (await isDirectory(option.output))
    ? pathe.join(option.output, CE_DEFAULT_VALUE.DB_FILE_NAME)
    : option.output;

  return dbPath;
}
