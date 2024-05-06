import { getExportedTypes } from '#/compilers/getExportedTypes';
import type { IGetExportTypesReturnType } from '#/compilers/interfaces/IGetExportTypesReturnType';
import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import { type Project } from 'ts-morph';

function applyOptionFilter(
  exportedTypes: ReturnType<typeof getExportedTypes>,
  option:
    | Pick<TAddSchemaOption, '$kind' | 'types'>
    | (Pick<TRefreshSchemaOption, '$kind' | 'cwd'> & { types?: string[] }),
) {
  const { types } = option;

  if (types == null) {
    return exportedTypes;
  }

  if (types.length === 0) {
    return exportedTypes;
  }

  return exportedTypes.filter((exportedType) => types.includes(exportedType.identifier));
}

export async function summarySchemaTypes(
  project: Project,
  schemaFilePaths: string[],
  option:
    | Pick<TAddSchemaOption, '$kind' | 'types' | 'cwd'>
    | (Pick<TRefreshSchemaOption, '$kind' | 'cwd'> & { types?: string[] }),
) {
  // stage01. Extract sll exported types
  const exportedTypes = getExportedTypes(project, schemaFilePaths);

  // stage02. apply type name filter in option
  const optionFilteredExportedTypes = applyOptionFilter(exportedTypes, option);

  // stage03. dedupe same item
  const exportedTypeMap = optionFilteredExportedTypes
    .map((exportedType) => {
      return {
        identifier: exportedType.identifier,
        filePath: exportedType.filePath,
        node: exportedType.node,
      };
    })
    .reduce<Map<string, Pick<IGetExportTypesReturnType, 'node' | 'identifier' | 'filePath'>>>(
      (aggregation, item) => {
        aggregation.set(`${item.identifier}://${item.filePath}`, item);
        return aggregation;
      },
      new Map<string, Pick<IGetExportTypesReturnType, 'node' | 'identifier' | 'filePath'>>(),
    );

  return Array.from(exportedTypeMap.values());
}
