import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { ISimpleExportedDeclaration } from '#/modules/cli/interfaces/ISimpleExportedDeclaration';
import { getAddMultipleTypesFromPrompt } from '#/modules/prompts/getAddMultipleTypesFromPrompt';
import { getAddSingleTypesFromPrompt } from '#/modules/prompts/getAddSingleTypesFromPrompt';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';
import type { LastArrayElement } from 'type-fest';

export async function getAddTypes(
  options: TAddSchemaOption,
  exportedTypes: ISimpleExportedDeclaration[],
): Promise<PassFailEither<Error, typeof exportedTypes>> {
  try {
    if (options.types.length <= 0) {
      const types = options.multiple
        ? await getAddMultipleTypesFromPrompt(options.cwd, exportedTypes)
        : await getAddSingleTypesFromPrompt(options.cwd, exportedTypes);

      return pass(types);
    }

    const exportedTypeMap = exportedTypes.reduce<
      Record<string, LastArrayElement<typeof exportedTypes>>
    >((aggregation, exportedType) => {
      return { ...aggregation, [exportedType.typeName]: exportedType };
    }, {});

    return pass(
      options.types
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
