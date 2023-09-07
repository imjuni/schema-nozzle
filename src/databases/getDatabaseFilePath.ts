import { isDirectory } from 'my-node-fp';
import path from 'path';
import { CE_DEFAULT_VALUE } from 'src/configs/interfaces/CE_DEFAULT_VALUE';
import type TAddSchemaOption from 'src/configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from 'src/configs/interfaces/TRefreshSchemaOption';
import type TWatchSchemaOption from 'src/configs/interfaces/TWatchSchemaOption';

export default async function getDatabaseFilePath(
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
