import type { IImportInfoMapElement } from 'ts-morph-short';

export function getIsExternal(
  importInfo?: Pick<IImportInfoMapElement, 'isExternal' | 'moduleFilePath'>,
) {
  if (importInfo == null) {
    return true;
  }

  if (importInfo.isExternal) {
    return true;
  }

  if (importInfo.moduleFilePath == null) {
    return true;
  }

  return false;
}
