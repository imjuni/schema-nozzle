import { CE_DEFAULT_VALUE } from '#configs/interfaces/CE_DEFAULT_VALUE';
import { exists } from 'my-node-fp';
import path from 'path';

export default async function getSchemaFilterFilePath(cwd: string, filePath?: string) {
  if (filePath != null && filePath !== '' && (await exists(path.resolve(filePath)))) {
    return path.resolve(filePath);
  }

  const defaultValue = path.resolve(path.join(cwd, CE_DEFAULT_VALUE.LIST_FILE));
  if (await exists(defaultValue)) {
    return defaultValue;
  }

  return undefined;
}
