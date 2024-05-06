import { makeProgressBar } from '#/cli/display/makeProgressBar';
import { makeSpinner } from '#/cli/display/makeSpinner';
import { showFailMessage } from '#/cli/display/showFailMessage';
import { getInlineExcludedFiles } from '#/compilers/comments/getInlineExcludedFiles';
import { getDiagnostics } from '#/compilers/getDiagnostics';
import { makeStatementInfoMap } from '#/compilers/makeStatementInfoMap';
import { summarySchemaTypes } from '#/compilers/summarySchemaTypes';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import { createRecord } from '#/databases/createRecord';
import { createStore } from '#/databases/createStore';
import { getDatabaseBuf } from '#/databases/files/getDatabaseBuf';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import { makeDatabase } from '#/databases/files/makeDatabase';
import { getSchemaIdStyle } from '#/databases/modules/getSchemaIdStyle';
import { GeneratedContainer } from '#/databases/repository/GeneratedContainer';
import { makeRepository } from '#/databases/repository/makeRepository';
import { upserts } from '#/databases/repository/upserts';
import { createJsonSchema } from '#/modules/generators/createJsonSchema';
import { makeSchemaGenerator } from '#/modules/generators/makeSchemaGenerator';
import { makeExcludeContainer } from '#/modules/scopes/makeExcludeContainer';
import { makeIncludeContianer } from '#/modules/scopes/makeIncludeContianer';
import { unlink } from 'fs/promises';
import { isError } from 'my-easy-fp';
import { exists } from 'my-node-fp';
import fs from 'node:fs';
import type * as tsm from 'ts-morph';
import { type getTypeScriptConfig } from 'ts-morph-short';

export async function refreshing(
  project: tsm.Project,
  tsconfig: ReturnType<typeof getTypeScriptConfig>,
  options: TRefreshSchemaOption,
) {
  const spinner = makeSpinner();
  const progress = makeProgressBar();

  try {
    const diagnostics = getDiagnostics({ options, project });

    if (diagnostics.type === 'fail') throw diagnostics.fail;
    if (diagnostics.pass === false) throw new Error('project compile error');

    const dbPath = await getDatabaseFilePath(options);

    if (options.truncate && (await exists(dbPath))) {
      spinner.start('truncate database, ...');
      await unlink(dbPath);
      spinner.stop('truncated database!', 'succeed');
    }

    await makeDatabase(dbPath);
    makeRepository();
    makeSchemaGenerator(options.resolved.project, options.generatorOption);

    const generatedContainer = new GeneratedContainer();
    const filePaths = project
      .getSourceFiles()
      .map((sourceFile) => sourceFile.getFilePath().toString());

    const includeContainer = makeIncludeContianer(options, tsconfig);
    const inlineExcludedFiles = getInlineExcludedFiles(project, options.resolved.projectDir);
    const excludeContainer = makeExcludeContainer(options, tsconfig, inlineExcludedFiles);

    const schemaFilePaths = filePaths
      .filter((filename) => includeContainer.isInclude(filename))
      .filter((filename) => !excludeContainer.isExclude(filename));

    makeStatementInfoMap(project, schemaFilePaths);

    const schemaTypes = await summarySchemaTypes(schemaFilePaths);
    const schemaIdStyle = getSchemaIdStyle(options);

    progress.start(schemaTypes.length, 0, 'refreshing: ');

    await Promise.all(
      schemaTypes.map(async (targetType) => {
        const schema = createJsonSchema(targetType.filePath, targetType.typeName);

        if (schema.type === 'fail') {
          generatedContainer.addErrors(schema.fail);
          progress.increment();
          return;
        }

        const items = createRecord({
          style: schemaIdStyle,
          escapeChar: options.escapeChar,
          rootDirs: options.rootDirs,
          schema: schema.pass,
        });

        generatedContainer.addRecord(...items.schemas);
        generatedContainer.addRefs(...items.refs);
        progress.increment();
      }),
    );

    progress.stop();

    await upserts(generatedContainer);

    const store = await createStore(options.serverUrl, schemaIdStyle);
    const buf = getDatabaseBuf(store);

    await fs.promises.writeFile(dbPath, buf);

    showFailMessage(generatedContainer.errors);

    spinner.stop(
      `[${schemaTypes.map((targetType) => `"${targetType.typeName}"`).join(', ')}] add complete`,
      'succeed',
    );
  } catch (caught) {
    spinner.stop('Error occured...', 'fail');
    const err = isError(caught, new Error('Unknown error raised'));
    throw err;
  }
}
