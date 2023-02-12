import { CE_DEFAULT_VALUE } from '#configs/interfaces/CE_DEFAULT_VALUE';
import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';
import { exists } from 'my-node-fp';
import path from 'path';

export default async function getSchemaListFilePath({
  filePath,
  resolvedPaths,
}: {
  filePath?: string;
  resolvedPaths: IResolvedPaths;
}) {
  if (filePath != null && (await exists(path.resolve(filePath)))) {
    return path.resolve(filePath);
  }

  const defaultValue = path.resolve(path.join(resolvedPaths.cwd, CE_DEFAULT_VALUE.LIST_FILE));
  if (await exists(defaultValue)) {
    return defaultValue;
  }

  return undefined;
}
