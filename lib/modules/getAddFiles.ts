import type IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import type IResolvedPaths from '@configs/interfaces/IResolvedPaths';
import getAddFilesFromPrompt from '@modules/getAddFilesFromPrompt';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';

export default async function getAddFiles({
  resolvedPaths,
  option,
}: {
  resolvedPaths: IResolvedPaths;
  option: IAddSchemaOption;
}): Promise<PassFailEither<Error, string[]>> {
  try {
    if (option.files == null || option.files.length <= 0) {
      const files = await getAddFilesFromPrompt(resolvedPaths, option.multiple);
      return pass(files);
    }

    return pass(option.files);
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised get typescript files');
    return fail(err);
  }
}
