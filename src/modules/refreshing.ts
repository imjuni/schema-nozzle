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
import { bootstrap as lokiBootstrap, instance as lokidb } from '#/databases/files/LokiDb';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import { getExcludePatterns } from '#/modules/files/getExcludePatterns';
import { getIncludePatterns } from '#/modules/files/getIncludePatterns';
import { GeneratorContainer } from '#/modules/generator/GeneratorContainer';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import { ExcludeContainer } from '#/modules/scopes/ExcludeContainer';
import { IncludeContainer } from '#/modules/scopes/IncludeContainer';
import { defaultExclude } from '#/modules/scopes/defaultExclude';
import { summarySchemaTypes } from '#/modules/summarySchemaTypes';
import { isError } from 'my-easy-fp';
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
      discriminator: 'refresh-schema',
      files: [],
      generatorOptionObject: {},
    };

    option.generatorOptionObject = await getSchemaGeneratorOption(option);
    const diagnostics = getDiagnostics({ option, project });

    if (diagnostics.type === 'fail') throw diagnostics.fail;
    if (diagnostics.pass === false) throw new Error('project compile error');

    const dbPath = await getDatabaseFilePath(option);
    GeneratorContainer.bootstrap(option);
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

    const items = schemaTypes
      .map((targetType) => {
        const schema = GeneratorContainer.it.create(targetType.filePath, targetType.identifier);

        if (schema.type === 'fail') {
          return undefined;
        }

        const item = createDatabaseItem(project, option, projectExportedTypes, schema.pass);
        const withDependencies = [item.item, ...(item.definitions ?? [])];

        return withDependencies;
      })
      .flat()
      .filter((record): record is IDatabaseItem => record != null);

    lokidb().merge(items);
    await lokidb().save();

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