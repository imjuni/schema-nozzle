import { addCurrentDirPrefix } from '#/modules/paths/addCurrentDirPrefix';
import { first } from 'my-easy-fp';
import { isDescendant } from 'my-node-fp';
import pathe from 'pathe';

export function getRelativePathByRootDirs(
  rootDirs: string[],
  typeName: string,
  dirPath: string,
): string {
  const parentDirs = rootDirs.filter((rootDir) => isDescendant(rootDir, dirPath));

  if (parentDirs.at(0) != null && first(parentDirs) === dirPath) {
    return typeName;
  }

  if (parentDirs.at(0) != null) {
    return addCurrentDirPrefix(pathe.join(pathe.relative(first(parentDirs), dirPath), typeName));
  }

  const resolvedParentDirs = rootDirs
    .map((rootDir) => pathe.resolve(rootDir))
    .filter((rootDir) => isDescendant(rootDir, dirPath));

  if (resolvedParentDirs.at(0) != null && first(resolvedParentDirs) === dirPath) {
    return typeName;
  }

  if (resolvedParentDirs.at(0) != null) {
    return addCurrentDirPrefix(
      pathe.join(pathe.relative(first(resolvedParentDirs), dirPath), typeName),
    );
  }

  return addCurrentDirPrefix(pathe.join(pathe.relative(first(rootDirs), dirPath), typeName));
}
