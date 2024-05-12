import { makeProgressBar } from '#/cli/display/makeProgressBar';
import { makeSpinner } from '#/cli/display/makeSpinner';
import { showFailMessage } from '#/cli/display/showFailMessage';
import { getInlineExcludedFiles } from '#/compilers/comments/getInlineExcludedFiles';
import { getDiagnostics } from '#/compilers/getDiagnostics';
import { makeStatementInfoMap } from '#/compilers/makeStatementInfoMap';
import { summarySchemaTypes } from '#/compilers/summarySchemaTypes';
import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import { createRecord } from '#/databases/createRecord';
import { createStore } from '#/databases/createStore';
import { getDatabaseBuf } from '#/databases/files/getDatabaseBuf';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import { makeDatabase } from '#/databases/files/makeDatabase';
import { getSchemaIdStyle } from '#/databases/modules/getSchemaIdStyle';
import { GeneratedContainer } from '#/databases/repository/GeneratedContainer';
import { makeRepository } from '#/databases/repository/makeRepository';
import { upserts } from '#/databases/repository/upserts';
import { getAddFiles } from '#/modules/cli/tools/getAddFiles';
import { getAddTypes } from '#/modules/cli/tools/getAddTypes';
import { createJsonSchema } from '#/modules/generators/createJsonSchema';
import { makeSchemaGenerator } from '#/modules/generators/makeSchemaGenerator';
import { makeExcludeContainer } from '#/modules/scopes/makeExcludeContainer';
import { makeIncludeContianer } from '#/modules/scopes/makeIncludeContianer';
import { getRelativeCwd } from '#/tools/getRelativeCwd';
import fs from 'fs';
import { isError } from 'my-easy-fp';
import type * as tsm from 'ts-morph';
import { type getTypeScriptConfig } from 'ts-morph-short';

export async function adding(
  project: tsm.Project,
  tsconfig: ReturnType<typeof getTypeScriptConfig>,
  options: TAddSchemaOption,
) {
  const spinner = makeSpinner();
  const progress = makeProgressBar();

  try {
    const diagnostics = getDiagnostics({ options, project });

    if (diagnostics.type === 'fail') throw diagnostics.fail;
    if (diagnostics.pass === false) throw new Error('project compile error');

    const dbPath = await getDatabaseFilePath(options);

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

    const selectedFiles = await getAddFiles(
      options,
      schemaFilePaths.map((schemaFilePath) => {
        return {
          origin: schemaFilePath,
          refined: getRelativeCwd(options.resolved.projectDir, schemaFilePath),
        };
      }),
    );

    if (selectedFiles.type === 'fail') throw selectedFiles.fail;
    const files = selectedFiles.pass.map((file) => file.origin);

    const everySchemaTypes = await summarySchemaTypes(files);
    const selectedTypes = await getAddTypes(options, everySchemaTypes);
    if (selectedTypes.type === 'fail') throw selectedTypes.fail;

    const types = selectedTypes.pass.map((exportedType) => exportedType.typeName);
    const schemaTypes = await summarySchemaTypes(files, types);
    const schemaIdStyle = getSchemaIdStyle({
      topRef: options.generatorOption.topRef ?? false,
      useSchemaPath: options.useSchemaPath,
    });

    progress.start(schemaTypes.length, 0, 'adding: ');

    await Promise.all(
      schemaTypes.map(async (selectedType) => {
        const schema = createJsonSchema(selectedType.filePath, selectedType.typeName);

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
          encodeRefs: options.generatorOption.encodeRefs,
          jsVar: options.jsVar,
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
