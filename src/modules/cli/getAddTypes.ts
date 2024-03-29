import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import { getAddMultipleTypesFromPrompt } from '#/modules/prompts/getAddMultipleTypesFromPrompt';
import { getAddSingleTypesFromPrompt } from '#/modules/prompts/getAddSingleTypesFromPrompt';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';
import type { LastArrayElement } from 'type-fest';

export async function getAddTypes(
  option: TAddSchemaOption,
  exportedTypes: { filePath: string; identifier: string }[],
): Promise<PassFailEither<Error, typeof exportedTypes>> {
  try {
    if (option.types.length <= 0) {
      const types = option.multiple
        ? await getAddMultipleTypesFromPrompt(option.cwd, exportedTypes)
        : await getAddSingleTypesFromPrompt(option.cwd, exportedTypes);

      return pass(types);
    }

    const exportedTypeMap = exportedTypes.reduce<
      Record<string, LastArrayElement<typeof exportedTypes>>
    >((aggregation, exportedType) => {
      return { ...aggregation, [exportedType.identifier]: exportedType };
    }, {});

    return pass(
      option.types
        .map((exportedType) => exportedTypeMap[exportedType])
        .filter(
          (exportedType): exportedType is LastArrayElement<typeof exportedTypes> =>
            exportedType != null,
        ),
    );
  } catch (caught) {
    const err = isError(caught, new Error('unknown error raised get typescript files'));
    return fail(err);
  }
}
