import type { Glob, GlobOptions } from 'glob';
import { replaceSepToPosix } from 'my-node-fp';
import pathe from 'pathe';

export function getGlobFiles<T extends GlobOptions>(glob: Glob<T>): string[] {
  const filePathSet = new Set<string>();

  for (const filePath of glob) {
    filePathSet.add(
      typeof filePath === 'string'
        ? replaceSepToPosix(filePath)
        : pathe.join(filePath.path, filePath.name),
    );
  }

  return Array.from(filePathSet);
}
