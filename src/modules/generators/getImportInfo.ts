import { container } from '#/modules/containers/container';
import { $YMBOL_KEY_STATEMENT_IMPORT_MAP } from '#/modules/containers/keys';
import { getGenericType } from '#/modules/generators/getGenericType';
import { isFalse } from 'my-easy-fp';
import type { getImportInfoMap } from 'ts-morph-short';

export function getImportInfo(typeName: string) {
  const importInfoMap = container.resolve<ReturnType<typeof getImportInfoMap>>(
    $YMBOL_KEY_STATEMENT_IMPORT_MAP,
  );
  const wsRemovedTypeName = typeName.replace(/\s/g, '');

  const importInfo = importInfoMap.get(wsRemovedTypeName);

  if (importInfo != null) {
    return importInfo;
  }

  const result = getGenericType(wsRemovedTypeName);

  if (isFalse(result.generic)) {
    return undefined;
  }

  const genericImportInfo = importInfoMap.get(result.name);

  if (genericImportInfo != null) {
    return genericImportInfo;
  }

  return undefined;
}
