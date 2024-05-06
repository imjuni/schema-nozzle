import { getExportedTypeMap } from '#/compilers/getExportedTypeMap';
import { getFileImportInfoMap } from '#/compilers/getFileImportInfoMap';
import { container } from '#/modules/containers/container';
import {
  STATEMENT_EXPORT_MAP_SYMBOL_KEY,
  STATEMENT_FILE_EXPORT_MAP_SYMBOL_KEY,
  STATEMENT_FILE_IMPORT_MAP_SYMBOL_KEY,
  STATEMENT_IMPORT_MAP_SYMBOL_KEY,
} from '#/modules/containers/keys';
import { asValue } from 'awilix';
import type * as tsm from 'ts-morph';
import { getImportInfoMap } from 'ts-morph-short';

export function makeStatementInfoMap(project: tsm.Project, filePaths: string[]) {
  const importInfoMap = getImportInfoMap(project);
  const fileImportInfoMap = getFileImportInfoMap(importInfoMap);
  const { exportedTypeMap, fileExportedTypeMap } = getExportedTypeMap(project, filePaths);

  container.register(STATEMENT_IMPORT_MAP_SYMBOL_KEY, asValue(importInfoMap));
  container.register(STATEMENT_FILE_IMPORT_MAP_SYMBOL_KEY, asValue(fileImportInfoMap));

  container.register(STATEMENT_EXPORT_MAP_SYMBOL_KEY, asValue(exportedTypeMap));
  container.register(STATEMENT_FILE_EXPORT_MAP_SYMBOL_KEY, asValue(fileExportedTypeMap));

  return importInfoMap;
}
