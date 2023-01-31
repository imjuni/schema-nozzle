import type IDeleteSchemaOption from '#configs/interfaces/IDeleteSchemaOption';
import getDeleteTypesFromPrompt from '#modules/getDeleteTypesFromPrompt';
import type { TNullableDatabase } from '#modules/interfaces/TDatabase';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';

export default async function getDeleteTypes({
  db,
  option,
}: {
  db: TNullableDatabase;
  option: IDeleteSchemaOption;
}): Promise<PassFailEither<Error, string[]>> {
  try {
    if (option.types == null || option.types.length <= 0) {
      const types = await getDeleteTypesFromPrompt({ db, isMultipleSelect: option.multiple });
      return pass(types);
    }

    return pass(option.types);
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised get typescript files');
    return fail(err);
  }
}
