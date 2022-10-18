import IBaseOption from '@configs/interfaces/IBaseOption';
import getFilterByModifier from '@modules/getFilterByModifier';
import { isError } from 'my-easy-fp';
import { fail, pass, PassFailEither } from 'my-only-either';
import * as tsm from 'ts-morph';

interface ISourceFileLoaderParams {
  project: tsm.Project;
  option: IBaseOption;
  files: string[];
}

export default function getSourceFiles({
  option,
  files,
  project,
}: ISourceFileLoaderParams): PassFailEither<Error, string[]> {
  try {
    const sourceFiles = project
      .getSourceFiles()
      .map((sourceFile) => sourceFile.getFilePath().toString());

    const filteredSourceFiles = getFilterByModifier(option, files).filter((targetFile) =>
      sourceFiles.includes(targetFile),
    );

    return pass(filteredSourceFiles);
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised');
    return fail(err);
  }
}
