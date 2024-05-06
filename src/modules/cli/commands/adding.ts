import { makeProgressBar } from '#/cli/display/makeProgressBar';
import { makeSpinner } from '#/cli/display/makeSpinner';
import { showFailMessage } from '#/cli/display/showFailMessage';
import { getInlineExcludedFiles } from '#/compilers/comments/getInlineExcludedFiles';
import { getDiagnostics } from '#/compilers/getDiagnostics';
import { makeStatementImportInfoMap } from '#/compilers/makeStatementImportInfoMap';
import { summarySchemaTypes } from '#/compilers/summarySchemaTypes';
import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import { createRecord } from '#/databases/createRecord';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import { getSQLDatabaseBuf } from '#/databases/files/getSQLDatabaseBuf';
import { makeSQLDatabase } from '#/databases/files/makeSQLDatabase';
import { getSchemaIdStyle } from '#/databases/modules/getSchemaIdStyle';
import { makeRepository } from '#/databases/repository/makeRepository';
import type { RefsRepository } from '#/databases/repository/refs/RefsRepository';
import type { SchemaRepository } from '#/databases/repository/schemas/SchemaRepository';
import { getAddFiles } from '#/modules/cli/tools/getAddFiles';
import { getAddTypes } from '#/modules/cli/tools/getAddTypes';
import { container } from '#/modules/containers/container';
import {
  REPOSITORY_REFS_SYMBOL_KEY,
  REPOSITORY_SCHEMAS_SYMBOL_KEY,
} from '#/modules/containers/keys';
import { GeneratedContainer } from '#/modules/generators/GeneratedContainer';
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

    await makeSQLDatabase(dbPath);
    makeRepository();
    makeSchemaGenerator(options.resolved.project, options.generatorOption);
    makeStatementImportInfoMap(project);

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
    const schemaIdStyle = getSchemaIdStyle(options);

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
        });

        generatedContainer.addRecord(...items.schemas);
        generatedContainer.addRefs(...items.refs);
        progress.increment();
      }),
    );

    progress.stop();

    const schemaRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
    const refRepo = container.resolve<RefsRepository>(REPOSITORY_REFS_SYMBOL_KEY);

    await Promise.all([
      ...generatedContainer.records.map((record) => schemaRepo.upsert(record)),
      ...generatedContainer.refs.map((ref) => refRepo.upsert(ref)),
    ]);

    await fs.promises.writeFile(dbPath, getSQLDatabaseBuf());

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
