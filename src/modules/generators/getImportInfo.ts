import { container } from '#/modules/containers/container';
import { STATEMENT_IMPORT_MAP_SYMBOL_KEY } from '#/modules/containers/keys';
import { getGenericType } from '#/modules/generators/getGenericType';
import { isFalse } from 'my-easy-fp';
import type { getImportInfoMap } from 'ts-morph-short';

export function getImportInfo(typeName: string) {
  const importInfoMap = container.resolve<ReturnType<typeof getImportInfoMap>>(
    STATEMENT_IMPORT_MAP_SYMBOL_KEY,
  );

  const importInfo = importInfoMap.get(typeName);

  if (importInfo != null) {
    return importInfo;
  }

  const result = getGenericType(typeName);

  if (isFalse(result.generic)) {
    return undefined;
  }

  const genericImportInfo = importInfoMap.get(result.name);

  if (genericImportInfo != null) {
    return genericImportInfo;
  }

  return undefined;
}
