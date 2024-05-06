import { container } from '#/modules/containers/container';
import { STATEMENT_IMPORT_MAP_SYMBOL_KEY } from '#/modules/containers/keys';
import { asValue } from 'awilix';
import type * as tsm from 'ts-morph';
import { getImportInfoMap } from 'ts-morph-short';

export function makeStatementImportInfoMap(project: tsm.Project) {
  const importMap = getImportInfoMap(project);
  container.register(STATEMENT_IMPORT_MAP_SYMBOL_KEY, asValue(importMap));
  return importMap;
}
