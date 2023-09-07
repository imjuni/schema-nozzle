import { exists } from 'my-node-fp';
import path from 'path';
import { CE_DEFAULT_VALUE } from 'src/configs/interfaces/CE_DEFAULT_VALUE';

export default async function getSchemaFilterFilePath(cwd: string, filePath?: string) {
  if (filePath != null && filePath !== '' && (await exists(path.resolve(filePath)))) {
    return path.resolve(filePath);
  }

  const defaultValue = path.resolve(path.join(cwd, CE_DEFAULT_VALUE.LIST_FILE_NAME));
  if (await exists(defaultValue)) {
    return defaultValue;
  }

  return undefined;
}
