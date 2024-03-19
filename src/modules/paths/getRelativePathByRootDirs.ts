import { addCurrentDirPrefix } from '#/modules/paths/addCurrentDirPrefix';
import { first } from 'my-easy-fp';
import { isDescendant } from 'my-node-fp';
import path from 'path';

export function getRelativePathByRootDirs(rootDirs: string[], filePath: string): string {
  const parentDirs = rootDirs.filter((rootDir) => isDescendant(rootDir, filePath));

  if (parentDirs.at(0) != null && first(parentDirs) === filePath) {
    return '';
  }

  if (parentDirs.at(0) != null) {
    return addCurrentDirPrefix(path.relative(first(parentDirs), filePath));
  }

  const resolvedParentDirs = rootDirs
    .map((rootDir) => path.resolve(rootDir))
    .filter((rootDir) => isDescendant(rootDir, filePath));

  if (resolvedParentDirs.at(0) != null && first(resolvedParentDirs) === filePath) {
    return '';
  }

  if (resolvedParentDirs.at(0) != null) {
    return addCurrentDirPrefix(path.relative(first(resolvedParentDirs), filePath));
  }

  return addCurrentDirPrefix(path.relative(first(rootDirs), filePath));
}
