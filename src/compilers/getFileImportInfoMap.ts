import type { IImportInfoMapElement, getImportInfoMap } from 'ts-morph-short';

export function getFileImportInfoMap(importInfoMap: ReturnType<typeof getImportInfoMap>) {
  const fileImportInfoMap = new Map<string, IImportInfoMapElement[]>();

  Array.from(importInfoMap.values()).forEach((importInfo) => {
    const { moduleFilePath } = importInfo;
    if (moduleFilePath != null) {
      const prev = fileImportInfoMap.get(moduleFilePath);

      if (prev != null) {
        fileImportInfoMap.set(moduleFilePath, [...prev, importInfo]);
      } else {
        fileImportInfoMap.set(moduleFilePath, [importInfo]);
      }
    }
  });

  return fileImportInfoMap;
}
