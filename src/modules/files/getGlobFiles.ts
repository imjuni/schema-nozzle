import { posixJoin } from '#/modules/paths/modules/posixJoin';
import type { Glob, GlobOptions } from 'glob';
import { replaceSepToPosix } from 'my-node-fp';

export function getGlobFiles<T extends GlobOptions>(glob: Glob<T>): string[] {
  const filePathSet = new Set<string>();

  for (const filePath of glob) {
    filePathSet.add(
      typeof filePath === 'string'
        ? replaceSepToPosix(filePath)
        : posixJoin(filePath.path, filePath.name),
    );
  }

  return Array.from(filePathSet);
}
