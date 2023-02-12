import getExportedFiles from '#compilers/getExportedFiles';
import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import getSchemaFileContent from '#modules/getSchemaFileContent';
import getSchemaListFilePath from '#modules/getSchemaListFilePath';
import isSourceFileInclude from '#modules/isSourceFileInclude';
import getRelativeCwd from '#tools/getRelativeCwd';
import ignore from 'ignore';
import type * as tsm from 'ts-morph';

function getFilePaths(
  filePaths: string[],
  option:
    | Pick<TAddSchemaOption, 'discriminator' | 'listFile' | 'files'>
    | Pick<TRefreshSchemaOption, 'discriminator' | 'listFile'>,
) {
  if (option.discriminator === 'add-schema') {
    return option.files.length > 0 ? option.files : filePaths;
  }

  return filePaths;
}

export default async function summarySchemaFiles(
  project: tsm.Project,
  option:
    | Pick<TAddSchemaOption, 'discriminator' | 'listFile' | 'files'>
    | Pick<TRefreshSchemaOption, 'discriminator' | 'listFile'>,
  resolvedPaths: IResolvedPaths,
) {
  const filePaths = getExportedFiles(project);

  // stage 01. filter target file by option.files
  const targetFiles = getFilePaths(filePaths, option);
  const optionFilesApplied = filePaths
    .filter((filePath) => isSourceFileInclude(targetFiles, filePath))
    .map((filePath) => ({
      origin: filePath,
      refined: getRelativeCwd(resolvedPaths.cwd, filePath),
    }));

  // stage 02. create ignore filter
  const schemaFileListFilePath = await getSchemaListFilePath({
    filePath: option.listFile,
    resolvedPaths,
  });

  // stage 03. cannot found target script file summary
  if (schemaFileListFilePath == null) {
    const filter = ignore().add(optionFilesApplied.map((filePath) => filePath.refined));
    return { filePaths: optionFilesApplied, filter };
  }

  // stage 04. target script file summary found apply it

  // create filter using by schema file summary
  const listFileFilter = ignore().add(await getSchemaFileContent(schemaFileListFilePath));
  const filteredFilePaths = optionFilesApplied.filter((filePath) =>
    listFileFilter.ignores(filePath.refined),
  );

  // create filePaths using by scheam file summary filter
  const filter = ignore().add(filteredFilePaths.map((filePath) => filePath.refined));
  return { filePaths: filteredFilePaths, filter };
}
