import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import { getAddMultipleFilesFromPrompt } from '#/modules/prompts/getAddMultipleFilesFromPrompt';
import { getAddSingleFilesFromPrompt } from '#/modules/prompts/getAddSingleFilesFromPrompt';
import { getRelativeCwd } from '#/tools/getRelativeCwd';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';
import path from 'node:path';

export async function getAddFiles(
  option: Pick<TAddSchemaOption, 'files' | 'multiple' | 'cwd'>,
  schemaFiles: { origin: string; refined: string }[],
): Promise<PassFailEither<Error, typeof schemaFiles>> {
  try {
    if (option.files.length <= 0) {
      const files = option.multiple
        ? await getAddMultipleFilesFromPrompt(schemaFiles)
        : await getAddSingleFilesFromPrompt(schemaFiles);

      return pass(files);
    }

    return pass(
      option.files
        .map((filePath) => (path.isAbsolute(filePath) ? filePath : path.resolve(filePath)))
        .map((filePath) => ({
          origin: filePath,
          refined: getRelativeCwd(option.cwd, filePath),
        })),
    );
  } catch (caught) {
    const err = isError(caught, new Error('unknown error raised get typescript files'));
    return fail(err);
  }
}
