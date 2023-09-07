import { type Ignore } from 'ignore';
import getExportedTypes from 'src/compilers/getExportedTypes';
import type IGetExportTypesReturnType from 'src/compilers/interfaces/IGetExportTypesReturnType';
import type TAddSchemaOption from 'src/configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from 'src/configs/interfaces/TRefreshSchemaOption';
import type TWatchSchemaOption from 'src/configs/interfaces/TWatchSchemaOption';
import getRelativeCwd from 'src/tools/getRelativeCwd';
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

export default async function summarySchemaTypes(
  project: Project,
  option:
    | Pick<TAddSchemaOption, 'discriminator' | 'types' | 'cwd'>
    | Pick<TRefreshSchemaOption, 'discriminator' | 'types' | 'cwd'>
    | Pick<TWatchSchemaOption, 'discriminator' | 'types' | 'cwd'>,
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
