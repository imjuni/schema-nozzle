import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';
import type * as tsm from 'ts-morph';

interface ISourceFileLoaderParams {
  project: tsm.Project;
  files: string[];
}

export function getSourceFiles({
  files,
  project,
}: ISourceFileLoaderParams): PassFailEither<Error, string[]> {
  try {
    const sourceFiles = project
      .getSourceFiles()
      .map((sourceFile) => sourceFile.getFilePath().toString());

    const filteredSourceFiles = files.filter((targetFile) => sourceFiles.includes(targetFile));

    return pass(filteredSourceFiles);
  } catch (caught) {
    const err = isError(caught, new Error('unknown error raised'));
    return fail(err);
  }
}
