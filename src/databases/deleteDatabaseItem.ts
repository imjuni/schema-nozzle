import { getExportedTypes } from '#/compilers/getExportedTypes';
import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import { createDatabaseItem } from '#/databases/createDatabaseItem';
import { find } from '#/databases/files/repository/find';
import { findOne } from '#/databases/files/repository/findOne';
import { remove } from '#/databases/files/repository/remove';
import { create as createJsonSchema } from '#/modules/generator/modules/create';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import type * as tsm from 'ts-morph';
import { getFileImportInfos } from 'ts-morph-short';
import type { SetRequired } from 'type-fest';

export function deleteDatabaseItem(
  project: tsm.Project,
  option: Pick<TDeleteSchemaOption, '$kind' | 'project' | 'projectDir' | 'rootDir'>,
  identifier: string,
) {
  const item = findOne({ id: { $eq: identifier } });

  if (item == null) {
    return [];
  }

  remove(item.id);

  const refItems = find({ $ref: { $contains: item.id } });

  const importInfos = refItems
    .filter(
      (refItem): refItem is SetRequired<typeof refItem, 'filePath'> => refItem.filePath != null,
    )
    .map((refItem) => getFileImportInfos(project, refItem.filePath))
    .flat();

  const items = importInfos
    .filter(
      (importInfo): importInfo is SetRequired<typeof importInfo, 'sourceFilePath'> =>
        importInfo.sourceFilePath != null,
    )
    .map((importInfo) => {
      const schema = createJsonSchema(importInfo.sourceFilePath, importInfo.name);

      if (schema.type === 'fail') {
        return undefined;
      }

      const projectExportedTypes = getExportedTypes(project, [importInfo.sourceFilePath]);
      const nextRefItem = createDatabaseItem(project, option, projectExportedTypes, schema.pass);
      const withDependencies = [nextRefItem.item, ...(nextRefItem.definitions ?? [])];
      return withDependencies;
    })
    .flat()
    .filter((record): record is IDatabaseItem => record != null);

  return items;
}
