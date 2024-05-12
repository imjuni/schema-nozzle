import { addCurrentDirPrefix } from '#/modules/paths/addCurrentDirPrefix';
import { atOrThrow } from 'my-easy-fp';
import { isDescendant } from 'my-node-fp';
import pathe from 'pathe';

export function getRelativePathByRootDirs(
  rootDirs: string[],
  typeName: string,
  dirPath: string,
): string {
  const parentDirs = rootDirs.filter((rootDir) => isDescendant(rootDir, dirPath));
  const firstParentDir = parentDirs.at(0);

  if (firstParentDir != null && firstParentDir === dirPath) {
    return typeName;
  }

  if (firstParentDir != null) {
    return addCurrentDirPrefix(pathe.join(pathe.relative(firstParentDir, dirPath), typeName));
  }

  const resolvedParentDirs = rootDirs
    .map((rootDir) => pathe.resolve(rootDir))
    .filter((rootDir) => isDescendant(rootDir, dirPath));
  const firstResolvedParentDir = resolvedParentDirs.at(0);

  if (firstResolvedParentDir != null && firstResolvedParentDir === dirPath) {
    return typeName;
  }

  if (firstResolvedParentDir != null) {
    return addCurrentDirPrefix(
      pathe.join(pathe.relative(firstResolvedParentDir, dirPath), typeName),
    );
  }

  return addCurrentDirPrefix(
    pathe.join(
      pathe.relative(
        atOrThrow(rootDirs, 0, new Error(`Cannot found root-dir: ${dirPath}`)),
        dirPath,
      ),
      typeName,
    ),
  );
}
