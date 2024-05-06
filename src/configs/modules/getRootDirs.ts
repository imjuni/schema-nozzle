import pathe from 'pathe';

export function getRootDirs(cwd: string, rootDirs?: string[]): string[] {
  if (rootDirs != null) {
    const dirs = rootDirs.map((rootDir) => {
      return pathe.isAbsolute(rootDir)
        ? pathe.resolve(rootDir)
        : pathe.resolve(pathe.join(cwd, rootDir));
    });

    return dirs;
  }

  return [cwd];
}
