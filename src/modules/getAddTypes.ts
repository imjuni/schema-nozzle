import getExportedTypes from '#compilers/getExportedTypes';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import getAddTypesFromPrompt from '#modules/getAddTypesFromPrompt';
import type IFileWithType from '#modules/interfaces/IFileWithType';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';
import type * as tsm from 'ts-morph';
import type { LastArrayElement } from 'type-fest';

export default async function getAddTypes({
  project,
  option,
}: {
  project: tsm.Project;
  option: TAddSchemaOption;
}): Promise<PassFailEither<Error, IFileWithType[]>> {
  try {
    if (option.types.length <= 0) {
      const types = await getAddTypesFromPrompt({
        project,
        option,
        isMultipleSelect: option.multiple,
      });
      return pass(types);
    }

    const exportedTypes = getExportedTypes(project);

    const exportedTypeMap = exportedTypes.reduce<
      Record<string, LastArrayElement<ReturnType<typeof getExportedTypes>>>
    >((aggregation, exportedType) => {
      return { ...aggregation, [exportedType.identifier]: exportedType };
    }, {});

    const filePathWithTypes = option.types
      .map((typeName) => exportedTypeMap[typeName])
      .map((exportedType) => {
        const filePathWithType: IFileWithType = {
          filePath: exportedType.filePath,
          typeName: exportedType.identifier,
        };

        return filePathWithType;
      });

    return pass(filePathWithTypes);
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised get typescript files');
    return fail(err);
  }
}
