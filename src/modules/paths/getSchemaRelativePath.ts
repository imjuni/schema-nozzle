import { getRelativePathByRootDirs } from '#/modules/paths/getRelativePathByRootDirs';
import { getDirnameSync } from 'my-node-fp';
import type { IImportInfoMapElement } from 'ts-morph-short';

export function getSchemaRelativePath({
  isExternal,
  typeName,
  rootDirs,
  importInfo,
}: {
  isExternal: boolean;
  typeName: string;
  rootDirs: string[];
  importInfo?: Pick<IImportInfoMapElement, 'moduleFilePath'>;
}) {
  if (isExternal) {
    return `external/${typeName}`;
  }

  if (importInfo == null) {
    return `external/${typeName}`;
  }

  const { moduleFilePath } = importInfo;

  if (moduleFilePath == null) {
    return `external/${typeName}`;
  }

  return getRelativePathByRootDirs(rootDirs, typeName, getDirnameSync(moduleFilePath));
}
