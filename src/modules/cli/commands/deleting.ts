import { makeProgressBar } from '#/cli/display/makeProgressBar';
import { makeSpinner } from '#/cli/display/makeSpinner';
import { showFailMessage } from '#/cli/display/showFailMessage';
import { getInlineExcludedFiles } from '#/compilers/comments/getInlineExcludedFiles';
import { getDiagnostics } from '#/compilers/getDiagnostics';
import { makeStatementInfoMap } from '#/compilers/makeStatementInfoMap';
import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import { createRecord } from '#/databases/createRecord';
import { createStore } from '#/databases/createStore';
import { deleteRecord } from '#/databases/deleteRecord';
import { getDatabaseBuf } from '#/databases/files/getDatabaseBuf';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import { makeDatabase } from '#/databases/files/makeDatabase';
import { getSchemaIdStyle } from '#/databases/modules/getSchemaIdStyle';
import { GeneratedContainer } from '#/databases/repository/GeneratedContainer';
import { makeRepository } from '#/databases/repository/makeRepository';
import type { SchemaRepository } from '#/databases/repository/schemas/SchemaRepository';
import { upserts } from '#/databases/repository/upserts';
import { getDeleteTypes } from '#/modules/cli/tools/getDeleteTypes';
import { container } from '#/modules/containers/container';
import { REPOSITORY_SCHEMAS_SYMBOL_KEY } from '#/modules/containers/keys';
import { createJsonSchema } from '#/modules/generators/createJsonSchema';
import { makeSchemaGenerator } from '#/modules/generators/makeSchemaGenerator';
import { makeExcludeContainer } from '#/modules/scopes/makeExcludeContainer';
import { makeIncludeContianer } from '#/modules/scopes/makeIncludeContianer';
import fs from 'node:fs';
import type * as tsm from 'ts-morph';
import type { getTypeScriptConfig } from 'ts-morph-short';

export async function deleting(
  project: tsm.Project,
  tsconfig: ReturnType<typeof getTypeScriptConfig>,
  options: TDeleteSchemaOption,
) {
  const spinner = makeSpinner();
  const progress = makeProgressBar();

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

  const schemasRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
  const schemaTypes = await schemasRepo.types();
  const targetTypes = await getDeleteTypes({ schemaTypes, options });
  if (targetTypes.type === 'fail') throw targetTypes.fail;

  const schemaIdStyle = getSchemaIdStyle({
    topRef: options.generatorOption.topRef ?? false,
    useSchemaPath: options.useSchemaPath,
  });

  const needUpdateSchemaIds = await schemasRepo.selects(
    (await Promise.all(targetTypes.pass.map((targetType) => deleteRecord(targetType)))).flat(),
  );

  progress.start(schemaTypes.length, 0, 'deleting: ');

  await Promise.all(
    needUpdateSchemaIds.map(async (record) => {
      if (record.filePath != null) {
        const schema = createJsonSchema(record.filePath, record.typeName);

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
      }
    }),
  );

  await upserts(generatedContainer);

  const store = await createStore(options.serverUrl, schemaIdStyle);
  const buf = getDatabaseBuf(store);

  await fs.promises.writeFile(dbPath, buf);

  showFailMessage(generatedContainer.errors);

  spinner.stop(
    `Start [${targetTypes.pass.map((targetType) => `"${targetType}"`).join(', ')}] deleted`,
    'succeed',
  );
}
