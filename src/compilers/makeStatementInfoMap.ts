import { getExportedTypeMap } from '#/compilers/getExportedTypeMap';
import { getFileImportInfoMap } from '#/compilers/getFileImportInfoMap';
import { container } from '#/modules/containers/container';
import {
  $YMBOL_KEY_STATEMENT_EXPORT_MAP,
  $YMBOL_KEY_STATEMENT_FILE_EXPORT_MAP,
  $YMBOL_KEY_STATEMENT_FILE_IMPORT_MAP,
  $YMBOL_KEY_STATEMENT_IMPORT_MAP,
} from '#/modules/containers/keys';
import { asValue } from 'awilix';
import type * as tsm from 'ts-morph';
import { getImportInfoMap } from 'ts-morph-short';

export function makeStatementInfoMap(project: tsm.Project, filePaths: string[]) {
  const importInfoMap = getImportInfoMap(project);
  const fileImportInfoMap = getFileImportInfoMap(importInfoMap);
  const { exportedTypeMap, fileExportedTypeMap } = getExportedTypeMap(project, filePaths);

  container.register($YMBOL_KEY_STATEMENT_IMPORT_MAP, asValue(importInfoMap));
  container.register($YMBOL_KEY_STATEMENT_FILE_IMPORT_MAP, asValue(fileImportInfoMap));

  container.register($YMBOL_KEY_STATEMENT_EXPORT_MAP, asValue(exportedTypeMap));
  container.register($YMBOL_KEY_STATEMENT_FILE_EXPORT_MAP, asValue(fileExportedTypeMap));

  return importInfoMap;
}
