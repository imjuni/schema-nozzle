import type { IImportInfoMapElement } from 'ts-morph-short';

export function getSchemaFilePath({
  isExternal,
  typeName,
  importInfo,
}: {
  isExternal: boolean;
  typeName: string;
  importInfo?: Pick<IImportInfoMapElement, 'moduleFilePath'>;
}) {
  if (isExternal) {
    return `external/${typeName}`;
  }

  if (importInfo == null) {
    return `external/${typeName}`;
  }

  const { moduleFilePath } = importInfo;

  if (moduleFilePath == null) {
    return `external/${typeName}`;
  }

  return moduleFilePath;
}
