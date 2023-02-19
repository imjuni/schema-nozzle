import getExportedFiles from '#compilers/getExportedFiles';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import type TWatchSchemaOption from '#configs/interfaces/TWatchSchemaOption';
import getSchemaFileContent from '#modules/getSchemaFileContent';
import getSchemaFilterFilePath from '#modules/getSchemaFilterFilePath';
import isSourceFileInclude from '#modules/isSourceFileInclude';
import getRelativeCwd from '#tools/getRelativeCwd';
import ignore from 'ignore';
import type * as tsm from 'ts-morph';

function getFilePaths(
  filePaths: string[],
  option:
    | Pick<TAddSchemaOption, 'discriminator' | 'listFile' | 'files'>
    | Pick<TRefreshSchemaOption, 'discriminator' | 'listFile' | 'files'>
    | Pick<TWatchSchemaOption, 'discriminator' | 'listFile' | 'files'>,
) {
  return option.files.length > 0 ? option.files : filePaths;
}

export default async function summarySchemaFiles(
  project: tsm.Project,
  option:
    | Pick<TAddSchemaOption, 'discriminator' | 'listFile' | 'files' | 'cwd'>
    | Pick<TRefreshSchemaOption, 'discriminator' | 'listFile' | 'files' | 'cwd'>
    | Pick<TWatchSchemaOption, 'discriminator' | 'listFile' | 'files' | 'cwd'>,
) {
  const filePaths = getExportedFiles(project);

  // stage 01. filter target file by option.files
  const targetFiles = getFilePaths(filePaths, option);
  const optionFilesApplied = filePaths
    .filter((filePath) => isSourceFileInclude(targetFiles, filePath))
    .map((filePath) => ({
      origin: filePath,
      refined: getRelativeCwd(option.cwd, filePath),
    }));

  // stage 02. create ignore filter
  const schemaFilterFilePath = await getSchemaFilterFilePath(option.cwd, option.listFile);

  // stage 03. cannot found target script file summary
  if (schemaFilterFilePath == null) {
    const filter = ignore().add(optionFilesApplied.map((filePath) => filePath.refined));
    return { filePaths: optionFilesApplied, filter };
  }

  // stage 04. target script file summary found apply it

  // create filter using by schema file summary
  const listFileFilter = ignore().add(await getSchemaFileContent(schemaFilterFilePath));
  const filteredFilePaths = optionFilesApplied.filter((filePath) =>
    listFileFilter.ignores(filePath.refined),
  );

  // create filePaths using by scheam file summary filter
  const filter = ignore().add(filteredFilePaths.map((filePath) => filePath.refined));
  return { filePaths: filteredFilePaths, filter };
}
