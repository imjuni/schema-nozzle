import path from 'path';

export function isSourceFileInclude(files: string[], file: string): boolean {
  if (files.includes(file)) {
    return true;
  }

  if (files.includes(path.basename(file))) {
    return true;
  }

  return false;
}
