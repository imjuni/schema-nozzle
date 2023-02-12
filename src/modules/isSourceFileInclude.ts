import path from 'path';

export default function isSourceFileInclude(files: string[], file: string): boolean {
  if (files.includes(file)) {
    return true;
  }

  if (files.includes(path.basename(file))) {
    return true;
  }

  return false;
}
