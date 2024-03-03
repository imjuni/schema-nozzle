import { showFailMessage } from '#/cli/display/showFailMessage';
import { spinner } from '#/cli/display/spinner';
import { getInlineExcludedFiles } from '#/compilers/comments/getInlineExcludedFiles';
import { getDiagnostics } from '#/compilers/getDiagnostics';
import { getExportedTypes } from '#/compilers/getExportedTypes';
import { getResolvedPaths } from '#/configs/getResolvedPaths';
import { getSchemaGeneratorOption } from '#/configs/getSchemaGeneratorOption';
import type { TAddSchemaBaseOption, TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import { createDatabaseItem } from '#/databases/createDatabaseItem';
import { bootstrap as lokiBootstrap, container as lokidb } from '#/databases/files/LokiDbContainer';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import { merge as mergeItems } from '#/databases/files/repository/merge';
import type { CreateJSONSchemaError } from '#/errors/CreateJsonSchemaError';
import { getAddFiles } from '#/modules/cli/getAddFiles';
import { getAddTypes } from '#/modules/cli/getAddTypes';
import { getExcludePatterns } from '#/modules/files/getExcludePatterns';
import { getIncludePatterns } from '#/modules/files/getIncludePatterns';
import { bootstrap as generatorBootstrap } from '#/modules/generator/NozzleGeneratorContainer';
import { create as createJsonSchema } from '#/modules/generator/modules/create';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import { ExcludeContainer } from '#/modules/scopes/ExcludeContainer';
import { IncludeContainer } from '#/modules/scopes/IncludeContainer';
import { defaultExclude } from '#/modules/scopes/defaultExclude';
import { summarySchemaTypes } from '#/modules/summarySchemaTypes';
import { getRelativeCwd } from '#/tools/getRelativeCwd';
import { isError } from 'my-easy-fp';
import type * as tsm from 'ts-morph';
import type { getTypeScriptConfig } from 'ts-morph-short';

export async function adding(
  project: tsm.Project,
  tsconfig: ReturnType<typeof getTypeScriptConfig>,
  baseOption: TAddSchemaBaseOption,
) {
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
    await lokiBootstrap({ filename: dbPath });
    generatorBootstrap(option);

    const filePaths = project
      .getSourceFiles()
      .map((sourceFile) => sourceFile.getFilePath().toString());

    const includeContainer = new IncludeContainer({
      patterns: getIncludePatterns(baseOption, tsconfig, baseOption.project),
      options: { absolute: true, ignore: defaultExclude, cwd: resolvedPaths.projectDir },
    });

    const inlineExcludedFiles = getInlineExcludedFiles(project, resolvedPaths.projectDir);

    /**
     * SourceCode를 읽어서 inline file exclude 된 파일을 별도로 전달한다. 이렇게 하는 이유는, 이 파일은 왜 포함되지
     * 않았지? 라는 등의 리포트를 생성할 때 한 곳에서 이 정보를 다 관리해야 리포트를 생성해서 보여줄 수 있기 때문이다
     */
    const excludeContainer = new ExcludeContainer({
      patterns: getExcludePatterns(baseOption, tsconfig),
      options: { absolute: true, ignore: defaultExclude, cwd: resolvedPaths.projectDir },
      inlineExcludedFiles,
    });

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

    const generatedItems = schemaTypes
      .map((selectedType) => {
        const schema = createJsonSchema(selectedType.filePath, selectedType.identifier);

        if (schema.type === 'fail') {
          return { $kind: 'error', error: schema.fail };
        }

        const item = createDatabaseItem(project, option, projectExportedTypes, schema.pass);
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
