import IBaseOption from '@configs/interfaces/IBaseOption';
import getAddTypesFromPrompt from '@modules/getAddTypesFromPrompt';
import { isError } from 'my-easy-fp';
import { fail, pass, PassFailEither } from 'my-only-either';
import * as tsm from 'ts-morph';

export default async function getAddTypes({
  project,
  option,
}: {
  project: tsm.Project;
  option: IBaseOption;
}): Promise<PassFailEither<Error, string[]>> {
  try {
    if (option.types == null || option.types.length <= 0) {
      const types = await getAddTypesFromPrompt({ project, option });
      return pass(types);
    }

    return pass(option.types);
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised get typescript files');
    return fail(err);
  }
}
