import { makeSpinner } from '#/cli/display/makeSpinner';
import { showFailMessage } from '#/cli/display/showFailMessage';
import { getInlineExcludedFiles } from '#/compilers/comments/getInlineExcludedFiles';
import { getDiagnostics } from '#/compilers/getDiagnostics';
import { getExportedTypes } from '#/compilers/getExportedTypes';
import { getResolvedPaths } from '#/configs/getResolvedPaths';
import { getSchemaGeneratorOption } from '#/configs/getSchemaGeneratorOption';
import type { TAddSchemaBaseOption, TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import { createDatabaseItem } from '#/databases/createDatabaseItem';
import { bootstrap as lokiBootstrap, getIt as lokidb } from '#/databases/files/LokiDbContainer';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import { merge as mergeItems } from '#/databases/files/repository_bak/merge';
import type { CreateJSONSchemaError } from '#/errors/CreateJsonSchemaError';
import { getAddFiles } from '#/modules/cli/getAddFiles';
import { getAddTypes } from '#/modules/cli/getAddTypes';
import { makeSchemaGenerator } from '#/modules/generator/makeSchemaGenerator';
import { createJsonSchema } from '#/modules/generator/modules/createJsonSchema';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import { makeExcludeContainer } from '#/modules/scopes/makeExcludeContainer';
import { makeIncludeContianer } from '#/modules/scopes/makeIncludeContianer';
import { summarySchemaTypes } from '#/modules/summarySchemaTypes';
import { getRelativeCwd } from '#/tools/getRelativeCwd';
import { isError } from 'my-easy-fp';
import type * as tsm from 'ts-morph';
import { getImportInfoMap, type getTypeScriptConfig } from 'ts-morph-short';

export async function adding(
  project: tsm.Project,
  tsconfig: ReturnType<typeof getTypeScriptConfig>,
  baseOption: TAddSchemaBaseOption,
) {
  const spinner = makeSpinner();

  try {
    const resolvedPaths = getResolvedPaths(baseOption);
    const option: TAddSchemaOption = {
      ...baseOption,
      ...resolvedPaths,
      files: [],
      multiple: true,
      $kind: 'add-schema',
      generatorOptionObject: {},
    };

    option.generatorOptionObject = await getSchemaGeneratorOption(option);

    const diagnostics = getDiagnostics({ option, project });

    if (diagnostics.type === 'fail') throw diagnostics.fail;
    if (diagnostics.pass === false) throw new Error('project compile error');

    const dbPath = await getDatabaseFilePath(option);
    lokiBootstrap({ filename: dbPath });
    makeSchemaGenerator(option);

    const filePaths = project
      .getSourceFiles()
      .map((sourceFile) => sourceFile.getFilePath().toString());

    const includeContainer = makeIncludeContianer(option, tsconfig);
    const inlineExcludedFiles = getInlineExcludedFiles(project, resolvedPaths.projectDir);
    const excludeContainer = makeExcludeContainer(option, tsconfig, inlineExcludedFiles);

    const schemaFilePaths = filePaths
      .filter((filename) => includeContainer.isInclude(filename))
      .filter((filename) => !excludeContainer.isExclude(filename));

    const selectedFiles = await getAddFiles(
      option,
      schemaFilePaths.map((schemaFilePath) => {
        return {
          origin: schemaFilePath,
          refined: getRelativeCwd(option.projectDir, schemaFilePath),
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
    const importMap = getImportInfoMap(project);

    const generatedItems = schemaTypes
      .map((selectedType) => {
        const schema = createJsonSchema(selectedType.filePath, selectedType.identifier);

        if (schema.type === 'fail') {
          return { $kind: 'error', error: schema.fail };
        }

        const item = createDatabaseItem(option, projectExportedTypes, schema.pass, importMap);
        const withDependencies = [item.item, ...(item.definitions ?? [])];

        return { $kind: 'item', items: withDependencies };
      })
      .flat();

    const errors = generatedItems
      .filter(
        (item): item is { $kind: 'fail'; error: CreateJSONSchemaError } => item.$kind === 'fail',
      )
      .map((item) => item.error);

    const items = generatedItems
      .filter((item): item is { $kind: 'pass'; items: IDatabaseItem[] } => item.$kind === 'pass')
      .map((item) => item.items)
      .flat();

    mergeItems(items);
    await lokidb().save();

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
