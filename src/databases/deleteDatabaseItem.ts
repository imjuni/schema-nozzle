import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import type { ISchemaRecord } from '#/databases/interfaces/ISchemaRecord';
import type { SchemaRepository } from '#/databases/repository/schemas/SchemaRepository';
import { container } from '#/modules/containers/container';
import { REPOSITORY_SCHEMAS_SYMBOL_KEY } from '#/modules/containers/keys';
import type * as tsm from 'ts-morph';
import type { getImportInfoMap } from 'ts-morph-short';

export async function deleteDatabaseItem(
  project: tsm.Project,
  option: Pick<TDeleteSchemaOption, '$kind' | 'project' | 'projectDir' | 'rootDirs'>,
  importMap: ReturnType<typeof getImportInfoMap>,
  identifier: string,
) {
  const schemaRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
  const item = await schemaRepo.select(identifier);

  if (item == null) {
    return [];
  }

  await schemaRepo.deletes([item.id]);

  /*
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
      const withDependencies = [nextRefItem.schemas, ...(nextRefItem.definitions ?? [])];
      return withDependencies;
    })
    .flat()
    .filter((record): record is IDatabaseItem => record != null);

    */
  // return items;
  return [] as ISchemaRecord[];
}
