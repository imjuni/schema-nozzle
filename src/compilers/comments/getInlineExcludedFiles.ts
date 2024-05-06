import { getInlineExclude } from '#/compilers/comments/getInlineExclude';
import { getSourceFileComments } from '#/compilers/comments/getSourceFileComments';
import type { IExcludeFile } from '#/compilers/comments/interfaces/IExcludeFile';
import type { IInlineExcludeInfo } from '#/compilers/comments/interfaces/IInlineExcludeInfo';
import { CE_JSDOC_EXTENDS } from '#/modules/const-enum/CE_JSDOC_EXTENDS';
import { isDescendant } from 'my-node-fp';
import pathe from 'pathe';
import type * as tsm from 'ts-morph';
import type { SetRequired } from 'type-fest';

export function getInlineExcludedFiles(project: tsm.Project, projectDir: string) {
  const sourceFiles = project.getSourceFiles();
  const descendantFiles = sourceFiles.filter((sourceFile) =>
    isDescendant(projectDir, pathe.resolve(sourceFile.getFilePath().toString())),
  );
  const excluded = descendantFiles
    .map((sourceFile): IExcludeFile => {
      const sourceFileComment = getSourceFileComments(sourceFile);

      const fileExcludeComment = sourceFileComment.comments
        .map((comment) =>
          getInlineExclude({
            comment,
            options: {
              keywords: [CE_JSDOC_EXTENDS.IGNORE_FILE_TAG, CE_JSDOC_EXTENDS.IGNORE_FILE_TAG_ALIAS],
            },
          }),
        )
        .filter((comment): comment is IInlineExcludeInfo => comment != null);

      const firstExcludeComment = fileExcludeComment.at(0);

      return {
        filePath: sourceFile.getFilePath().toString(),
        fileExcludeComment,
        firstExcludeComment,
        excluded: firstExcludeComment != null,
      } satisfies IExcludeFile;
    })
    .filter(
      (exclude): exclude is SetRequired<IExcludeFile, 'firstExcludeComment'> =>
        exclude.firstExcludeComment != null && exclude.excluded,
    )
    .map((exclude) => {
      return {
        ...exclude.firstExcludeComment,
        filePath: exclude.filePath,
      };
    });

  return excluded;
}
