import type { IGenerateOption } from '#/configs/interfaces/IGenerateOption';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';
import type * as tsm from 'ts-morph';

interface IGetDiagnostics {
  options: Pick<IGenerateOption, 'skipError'>;
  project: tsm.Project;
}

export function getDiagnostics({
  options,
  project,
}: IGetDiagnostics): PassFailEither<Error, boolean> {
  try {
    if (options.skipError === false) {
      const diagnostics = project.getPreEmitDiagnostics();
      const diagnosticFiles = diagnostics
        .map((diagnostic) => diagnostic.getSourceFile())
        .filter(
          (diagnosticSourceFile): diagnosticSourceFile is tsm.SourceFile =>
            diagnosticSourceFile != null,
        )
        .map((diagnosticSourceFile) =>
          diagnosticSourceFile.getSourceFile().getFilePath().toString(),
        )
        .reduce((filePathSet, diagnosticFilePath) => {
          filePathSet.add(diagnosticFilePath);
          return filePathSet;
        }, new Set<string>());

      if (diagnosticFiles.size > 0) {
        return fail(new Error(`Compile error from: ${Array.from(diagnosticFiles).join(', ')}`));
      }

      return pass(true);
    }

    return pass(true);
  } catch (caught) {
    const err = isError(caught, new Error('unknown error raised'));
    return fail(err);
  }
}
