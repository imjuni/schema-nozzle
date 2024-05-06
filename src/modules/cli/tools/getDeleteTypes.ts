import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import { getDeleteTypesFromPrompt } from '#/modules/prompts/getDeleteTypesFromPrompt';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';

export async function getDeleteTypes({
  schemaTypes,
  option,
}: {
  schemaTypes: { filePath?: string; id: string }[];
  option: TDeleteSchemaOption;
}): Promise<PassFailEither<Error, string[]>> {
  try {
    if (option.types.length <= 0) {
      const types = await getDeleteTypesFromPrompt({
        schemaTypes,
        isMultipleSelect: option.multiple,
      });
      return pass(types);
    }

    return pass(option.types);
  } catch (caught) {
    const err = isError(caught) ?? new Error('unknown error raised get typescript files');
    return fail(err);
  }
}
