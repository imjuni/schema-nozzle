import path from 'node:path/posix';

export function replaceDraft(version: string, draft: number) {
  return version
    .split(path.sep)
    .map((element) => element.trim())
    .map((element) => {
      if (/draft-\d?\d/.test(element)) {
        return `draft-${`${draft}`.padStart(2, '0')}`;
      }

      return element;
    })
    .join(path.sep);
}
