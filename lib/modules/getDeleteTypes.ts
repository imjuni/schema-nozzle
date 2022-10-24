import IBaseOption from '@configs/interfaces/IBaseOption';
import getDeleteTypesFromPrompt from '@modules/getDeleteTypesFromPrompt';
import { TNullableDatabase } from '@modules/interfaces/TDatabase';
import { isError } from 'my-easy-fp';
import { fail, pass, PassFailEither } from 'my-only-either';

export default async function getDeleteTypes({
  db,
  option,
}: {
  db: TNullableDatabase;
  option: IBaseOption;
}): Promise<PassFailEither<Error, string[]>> {
  try {
    if (option.types == null || option.types.length <= 0) {
      const types = await getDeleteTypesFromPrompt({ db, option });
      return pass(types);
    }

    return pass(option.types);
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised get typescript files');
    return fail(err);
  }
}
