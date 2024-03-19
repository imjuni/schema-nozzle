import path from 'node:path';

export function addCurrentDirPrefix(filePath: string, sep?: string): string {
  const pathSep = sep ?? path.posix.sep;

  if (filePath.startsWith(`.${pathSep}`)) {
    return filePath.replace(`.${pathSep}`, '');
  }

  if (filePath === '') {
    return `.${pathSep}`;
  }

  return filePath;
}
