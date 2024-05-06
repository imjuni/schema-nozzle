import { makeSpinner } from '#/cli/display/makeSpinner';
import { showFailMessage } from '#/cli/display/showFailMessage';
import { getInlineExcludedFiles } from '#/compilers/comments/getInlineExcludedFiles';
import { getDiagnostics } from '#/compilers/getDiagnostics';
import { getExportedTypes } from '#/compilers/getExportedTypes';
import { makeStatementImportInfoMap } from '#/compilers/makeStatementImportInfoMap';
import { summarySchemaTypes } from '#/compilers/summarySchemaTypes';
import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import { createDatabaseItem } from '#/databases/createDatabaseItem';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import { makeSQLDatabase } from '#/databases/files/makeSQLDatabase';
import { makeRepository } from '#/databases/repository/makeRepository';
import type { CreateJSONSchemaError } from '#/errors/CreateJsonSchemaError';
import { getAddFiles } from '#/modules/cli/tools/getAddFiles';
import { getAddTypes } from '#/modules/cli/tools/getAddTypes';
import { createJsonSchema } from '#/modules/generators/createJsonSchema';
import { makeSchemaGenerator } from '#/modules/generators/makeSchemaGenerator';
import { makeExcludeContainer } from '#/modules/scopes/makeExcludeContainer';
import { makeIncludeContianer } from '#/modules/scopes/makeIncludeContianer';
import { getRelativeCwd } from '#/tools/getRelativeCwd';
import { isError } from 'my-easy-fp';
import type * as tsm from 'ts-morph';
import { type getTypeScriptConfig } from 'ts-morph-short';

export async function adding(
  project: tsm.Project,
  tsconfig: ReturnType<typeof getTypeScriptConfig>,
  option: TAddSchemaOption,
) {
  const spinner = makeSpinner();

  try {
    const diagnostics = getDiagnostics({ option, project });

    if (diagnostics.type === 'fail') throw diagnostics.fail;
    if (diagnostics.pass === false) throw new Error('project compile error');

    const dbPath = await getDatabaseFilePath(option);

    await makeSQLDatabase(dbPath);
    makeRepository();
    makeSchemaGenerator(option);
    makeStatementImportInfoMap(project);

    const filePaths = project
      .getSourceFiles()
      .map((sourceFile) => sourceFile.getFilePath().toString());

    const includeContainer = makeIncludeContianer(option, tsconfig);
    const inlineExcludedFiles = getInlineExcludedFiles(project, option.resolved.projectDir);
    const excludeContainer = makeExcludeContainer(option, tsconfig, inlineExcludedFiles);

    const schemaFilePaths = filePaths
      .filter((filename) => includeContainer.isInclude(filename))
      .filter((filename) => !excludeContainer.isExclude(filename));

    const selectedFiles = await getAddFiles(
      option,
      schemaFilePaths.map((schemaFilePath) => {
        return {
          origin: schemaFilePath,
          refined: getRelativeCwd(option.resolved.projectDir, schemaFilePath),
        };
      }),
    );

    if (selectedFiles.type === 'fail') throw selectedFiles.fail;
    option.files = selectedFiles.pass.map((file) => file.origin);

    const summariedSchemaTypes = await summarySchemaTypes(project, option.files, option);
    const selectedTypes = await getAddTypes(option, summariedSchemaTypes);
    if (selectedTypes.type === 'fail') throw selectedTypes.fail;
    const projectExportedTypes = getExportedTypes(project, option.files);

    option.types = selectedTypes.pass.map((exportedType) => exportedType.identifier);
    const schemaTypes = await summarySchemaTypes(project, option.files, {
      ...option,
      types: option.types,
    });

    const generatedItems = schemaTypes
      .map((selectedType) => {
        const schema = createJsonSchema(selectedType.filePath, selectedType.identifier);

        if (schema.type === 'fail') {
          return { $kind: 'error', error: schema.fail };
        }

        const items = createDatabaseItem(option, projectExportedTypes, schema.pass);

        return { $kind: 'item', items };
      })
      .flat();

    const errors = generatedItems
      .filter(
        (item): item is { $kind: 'fail'; error: CreateJSONSchemaError } => item.$kind === 'fail',
      )
      .map((item) => item.error);

    showFailMessage(errors);

    spinner.stop(
      `[${schemaTypes.map((targetType) => `"${targetType.identifier}"`).join(', ')}] add complete`,
      'succeed',
    );
  } catch (caught) {
    spinner.stop('Error occured...', 'fail');
    const err = isError(caught, new Error('Unknown error raised'));
    throw err;
  }
}
