import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import { getAddMultipleFilesFromPrompt } from '#/modules/prompts/getAddMultipleFilesFromPrompt';
import { getAddSingleFilesFromPrompt } from '#/modules/prompts/getAddSingleFilesFromPrompt';
import { getRelativeCwd } from '#/tools/getRelativeCwd';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';
import pathe from 'pathe';

export async function getAddFiles(
  options: Pick<TAddSchemaOption, 'files' | 'multiple' | 'resolved'>,
  schemaFiles: { origin: string; refined: string }[],
): Promise<PassFailEither<Error, typeof schemaFiles>> {
  try {
    if (options.files.length <= 0) {
      const files = options.multiple
        ? await getAddMultipleFilesFromPrompt(schemaFiles)
        : await getAddSingleFilesFromPrompt(schemaFiles);

      return pass(files);
    }

    return pass(
      options.files
        .map((filePath) => (pathe.isAbsolute(filePath) ? filePath : pathe.resolve(filePath)))
        .map((filePath) => ({
          origin: filePath,
          refined: getRelativeCwd(options.resolved.cwd, filePath),
        })),
    );
  } catch (caught) {
    const err = isError(caught, new Error('unknown error raised get typescript files'));
    return fail(err);
  }
}
