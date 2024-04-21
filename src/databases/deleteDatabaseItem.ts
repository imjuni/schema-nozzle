import { getExportedTypes } from '#/compilers/getExportedTypes';
import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import { createDatabaseItem } from '#/databases/createDatabaseItem';
import { find } from '#/databases/files/repository_bak/find';
import { findOne } from '#/databases/files/repository_bak/findOne';
import { remove } from '#/databases/files/repository_bak/remove';
import { createJsonSchema } from '#/modules/generator/modules/createJsonSchema';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import type * as tsm from 'ts-morph';
import type { getImportInfoMap, IImportInfoMapElement } from 'ts-morph-short';
import type { SetRequired } from 'type-fest';

export function deleteDatabaseItem(
  project: tsm.Project,
  option: Pick<TDeleteSchemaOption, '$kind' | 'project' | 'projectDir' | 'rootDirs'>,
  importMap: ReturnType<typeof getImportInfoMap>,
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
    .map((refItem) => {
      const importInfo = importMap.get(refItem.typeName);

      if (importInfo != null) {
        importInfo.sourceFilePath.set(refItem.filePath, false);
      }

      return importInfo;
    })
    .filter((importInfo): importInfo is IImportInfoMapElement => importInfo != null);

  const items = importInfos
    .map((importInfo) => {
      return Array.from(importInfo.sourceFilePath.entries()).map(([filePath, include]) => ({
        filePath,
        typeName: importInfo.name,
        include: !include,
      }));
    })
    .flat()
    .map((importInfo) => {
      const schema = createJsonSchema(importInfo.filePath, importInfo.typeName);

      if (schema.type === 'fail') {
        return undefined;
      }

      const projectExportedTypes = getExportedTypes(project, [importInfo.filePath]);
      const nextRefItem = createDatabaseItem(option, projectExportedTypes, schema.pass, importMap);
      const withDependencies = [nextRefItem.item, ...(nextRefItem.definitions ?? [])];
      return withDependencies;
    })
    .flat()
    .filter((record): record is IDatabaseItem => record != null);

  return items;
}
