import { makeProgressBar } from '#/cli/display/makeProgressBar';
import { makeSpinner } from '#/cli/display/makeSpinner';
import { showFailMessage } from '#/cli/display/showFailMessage';
import { getDiagnostics } from '#/compilers/getDiagnostics';
import { makeStatementImportInfoMap } from '#/compilers/makeStatementImportInfoMap';
import type { TDeleteSchemaOption } from '#/configs/interfaces/TDeleteSchemaOption';
import { createRecord } from '#/databases/createRecord';
import { deleteRecord } from '#/databases/deleteDatabaseItem';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import { getSQLDatabaseBuf } from '#/databases/files/getSQLDatabaseBuf';
import { makeSQLDatabase } from '#/databases/files/makeSQLDatabase';
import { getSchemaIdStyle } from '#/databases/modules/getSchemaIdStyle';
import { makeRepository } from '#/databases/repository/makeRepository';
import type { RefsRepository } from '#/databases/repository/refs/RefsRepository';
import type { SchemaRepository } from '#/databases/repository/schemas/SchemaRepository';
import { getDeleteTypes } from '#/modules/cli/tools/getDeleteTypes';
import { container } from '#/modules/containers/container';
import {
  REPOSITORY_REFS_SYMBOL_KEY,
  REPOSITORY_SCHEMAS_SYMBOL_KEY,
} from '#/modules/containers/keys';
import { GeneratedContainer } from '#/modules/generators/GeneratedContainer';
import { createJsonSchema } from '#/modules/generators/createJsonSchema';
import { makeSchemaGenerator } from '#/modules/generators/makeSchemaGenerator';
import fs from 'node:fs';
import type * as tsm from 'ts-morph';

export async function deleting(project: tsm.Project, options: TDeleteSchemaOption) {
  const spinner = makeSpinner();
  const progress = makeProgressBar();

  const diagnostics = getDiagnostics({ options, project });

  if (diagnostics.type === 'fail') throw diagnostics.fail;
  if (diagnostics.pass === false) throw new Error('project compile error');

  const dbPath = await getDatabaseFilePath(options);

  await makeSQLDatabase(dbPath);
  makeRepository();
  makeSchemaGenerator(options.resolved.project, options.generatorOption);
  makeStatementImportInfoMap(project);

  const generatedContainer = new GeneratedContainer();

  const schemasRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
  const schemaTypes = await schemasRepo.types();
  const targetTypes = await getDeleteTypes({ schemaTypes, options });
  if (targetTypes.type === 'fail') throw targetTypes.fail;

  const schemaIdStyle = getSchemaIdStyle(options);

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
        });

        generatedContainer.addRecord(...items.schemas);
        generatedContainer.addRefs(...items.refs);
      }
    }),
  );

  const schemaRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
  const refRepo = container.resolve<RefsRepository>(REPOSITORY_REFS_SYMBOL_KEY);

  await Promise.all([
    ...generatedContainer.records.map((record) => schemaRepo.upsert(record)),
    ...generatedContainer.refs.map((ref) => refRepo.upsert(ref)),
  ]);

  await fs.promises.writeFile(dbPath, getSQLDatabaseBuf());

  showFailMessage(generatedContainer.errors);

  spinner.stop(
    `Start [${targetTypes.pass.map((targetType) => `"${targetType}"`).join(', ')}] deleted`,
    'succeed',
  );
}
