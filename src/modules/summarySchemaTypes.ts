import getExportedTypes, { type IGetExportTypesReturnType } from '#compilers/getExportedTypes';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import getRelativeCwd from '#tools/getRelativeCwd';
import { type Ignore } from 'ignore';
import { type Project } from 'ts-morph';

function applyOptionFilter(
  exportedTypes: ReturnType<typeof getExportedTypes>,
  option:
    | Pick<TAddSchemaOption, 'discriminator' | 'types'>
    | Pick<TRefreshSchemaOption, 'discriminator' | 'types'>,
) {
  if (option.types.length <= 0) {
    return exportedTypes;
  }

  return exportedTypes.filter((exportedType) => option.types.includes(exportedType.identifier));
}

export default async function summarySchemaTypes(
  project: Project,
  option:
    | Pick<TAddSchemaOption, 'discriminator' | 'types' | 'cwd'>
    | Pick<TRefreshSchemaOption, 'discriminator' | 'types' | 'cwd'>,
  filter?: Ignore,
) {
  // stage01. Extract sll exported types
  const exportedTypes = getExportedTypes(project);

  // stage02. apply type name filter in option
  const optionFilteredExportedTypes = applyOptionFilter(exportedTypes, option);

  // stage03. apply file name filter
  const filteredExportedTypes = optionFilteredExportedTypes.filter(
    (exportedType) => filter?.ignores(getRelativeCwd(option.cwd, exportedType.filePath)) ?? true,
  );

  // stage04. dedupe same item
  const exportedTypeMap = filteredExportedTypes
    .map((exportedType) => {
      return {
        identifier: exportedType.identifier,
        filePath: exportedType.filePath,
      };
    })
    .reduce<Record<string, Pick<IGetExportTypesReturnType, 'identifier' | 'filePath'>>>(
      (aggregation, item) => {
        return { ...aggregation, [`${item.identifier}://${item.filePath}`]: item };
      },
      {},
    );

  return Object.values(exportedTypeMap);
}
