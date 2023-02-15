import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import getAddMultipleTypesFromPrompt from '#modules/getAddMultipleTypesFromPrompt';
import getAddSingleTypesFromPrompt from '#modules/getAddSingleTypesFromPrompt';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';
import type { LastArrayElement } from 'type-fest';

export default async function getAddTypes(
  option: TAddSchemaOption,
  exportedTypes: { filePath: string; identifier: string }[],
): Promise<PassFailEither<Error, typeof exportedTypes>> {
  try {
    if (option.types.length <= 0) {
      const types = option.multiple
        ? await getAddMultipleTypesFromPrompt(exportedTypes)
        : await getAddSingleTypesFromPrompt(exportedTypes);

      return pass(types);
    }

    const exportedTypeMap = exportedTypes.reduce<
      Record<string, LastArrayElement<typeof exportedTypes>>
    >((aggregation, exportedType) => {
      return { ...aggregation, [exportedType.identifier]: exportedType };
    }, {});

    return pass(option.types.map((exportedType) => exportedTypeMap[exportedType]));
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised get typescript files');
    return fail(err);
  }
}
