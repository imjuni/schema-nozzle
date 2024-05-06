import { getFileImportInfoMap } from '#/compilers/getFileImportInfoMap';
import { container } from '#/modules/containers/container';
import {
  STATEMENT_FILE_IMPORT_MAP_SYMBOL_KEY,
  STATEMENT_IMPORT_MAP_SYMBOL_KEY,
} from '#/modules/containers/keys';
import { asValue } from 'awilix';
import type * as tsm from 'ts-morph';
import { getImportInfoMap } from 'ts-morph-short';

export function makeStatementImportInfoMap(project: tsm.Project) {
  const importInfoMap = getImportInfoMap(project);
  const fileImportInfoMap = getFileImportInfoMap(importInfoMap);

  container.register(STATEMENT_IMPORT_MAP_SYMBOL_KEY, asValue(importInfoMap));
  container.register(STATEMENT_FILE_IMPORT_MAP_SYMBOL_KEY, asValue(fileImportInfoMap));

  return importInfoMap;
}
