import { showFailMessage } from '#/cli/display/showFailMessage';
import { spinner } from '#/cli/display/spinner';
import { getInlineExcludedFiles } from '#/compilers/comments/getInlineExcludedFiles';
import { getDiagnostics } from '#/compilers/getDiagnostics';
import { getExportedTypes } from '#/compilers/getExportedTypes';
import { getResolvedPaths } from '#/configs/getResolvedPaths';
import { getSchemaGeneratorOption } from '#/configs/getSchemaGeneratorOption';
import type {
  TRefreshSchemaBaseOption,
  TRefreshSchemaOption,
} from '#/configs/interfaces/TRefreshSchemaOption';
import { createDatabaseItem } from '#/databases/createDatabaseItem';
import { dbBootstrap as lokiBootstrap, getDb as lokidb } from '#/databases/files/LokiDbContainer';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import { merge as mergeItems } from '#/databases/files/repository/merge';
import type { CreateJSONSchemaError } from '#/errors/CreateJsonSchemaError';
import { getExcludePatterns } from '#/modules/files/getExcludePatterns';
import { getIncludePatterns } from '#/modules/files/getIncludePatterns';
import { generatorBootstrap } from '#/modules/generator/NozzleGeneratorContainer';
import { createJsonSchema } from '#/modules/generator/modules/createJsonSchema';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import { ExcludeContainer } from '#/modules/scopes/ExcludeContainer';
import { IncludeContainer } from '#/modules/scopes/IncludeContainer';
import { defaultExclude } from '#/modules/scopes/defaultExclude';
import { summarySchemaTypes } from '#/modules/summarySchemaTypes';
import { unlink } from 'fs/promises';
import { isError } from 'my-easy-fp';
import { exists } from 'my-node-fp';
import type * as tsm from 'ts-morph';
import type { getTypeScriptConfig } from 'ts-morph-short';

export async function refreshing(
  project: tsm.Project,
  tsconfig: ReturnType<typeof getTypeScriptConfig>,
  baseOption: TRefreshSchemaBaseOption,
) {
  try {
    const resolvedPaths = getResolvedPaths(baseOption);
    const option: TRefreshSchemaOption = {
      ...baseOption,
      ...resolvedPaths,
      $kind: 'refresh-schema',
      files: [],
      generatorOptionObject: {},
    };

    option.generatorOptionObject = await getSchemaGeneratorOption(option);
    const diagnostics = getDiagnostics({ option, project });

    if (diagnostics.type === 'fail') throw diagnostics.fail;
    if (diagnostics.pass === false) throw new Error('project compile error');

    const dbPath = await getDatabaseFilePath(option);
    generatorBootstrap(option);

    if (option.truncate && (await exists(dbPath))) {
      spinner.start('truncate database, ...');
      await unlink(dbPath);
      spinner.stop('truncated database!', 'succeed');
    }

    await lokiBootstrap({ filename: dbPath });

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

    const projectExportedTypes = getExportedTypes(project, schemaFilePaths);
    const schemaTypes = await summarySchemaTypes(project, schemaFilePaths, option);

    const generatedItems = schemaTypes
      .map((targetType) => {
        const schema = createJsonSchema(targetType.filePath, targetType.identifier);

        if (schema.type === 'fail') {
          return { $kind: 'fail', error: schema.fail };
        }

        const item = createDatabaseItem(project, option, projectExportedTypes, schema.pass);
        const withDependencies = [item.item, ...(item.definitions ?? [])];

        return { $kind: 'pass', items: withDependencies };
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
