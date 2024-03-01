import { getExportedTypes } from '#/compilers/getExportedTypes';
import type { IGetExportTypesReturnType } from '#/compilers/interfaces/IGetExportTypesReturnType';
import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import type { TWatchSchemaOption } from '#/configs/interfaces/TWatchSchemaOption';
import { type Project } from 'ts-morph';

function applyOptionFilter(
  exportedTypes: ReturnType<typeof getExportedTypes>,
  option:
    | Pick<TAddSchemaOption, 'discriminator' | 'types'>
    | Pick<TRefreshSchemaOption, 'discriminator' | 'types'>
    | Pick<TWatchSchemaOption, 'discriminator' | 'types'>,
) {
  if (option.types.length <= 0) {
    return exportedTypes;
  }

  return exportedTypes.filter((exportedType) => option.types.includes(exportedType.identifier));
}

export async function summarySchemaTypes(
  project: Project,
  schemaFilePaths: string[],
  option:
    | Pick<TAddSchemaOption, 'discriminator' | 'types' | 'cwd'>
    | Pick<TRefreshSchemaOption, 'discriminator' | 'types' | 'cwd'>
    | Pick<TWatchSchemaOption, 'discriminator' | 'types' | 'cwd'>,
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
      };
    })
    .reduce<Map<string, Pick<IGetExportTypesReturnType, 'identifier' | 'filePath'>>>(
      (aggregation, item) => {
        aggregation.set(`${item.identifier}://${item.filePath}`, item);
        return aggregation;
      },
      new Map<string, Pick<IGetExportTypesReturnType, 'identifier' | 'filePath'>>(),
    );

  return Array.from(exportedTypeMap.values());
}
