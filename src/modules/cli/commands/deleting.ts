import { makeSpinner } from '#/cli/display/makeSpinner';
import { getDiagnostics } from '#/compilers/getDiagnostics';
import { getResolvedPaths } from '#/configs/getResolvedPaths';
import type {
  TDeleteSchemaBaseOption,
  TDeleteSchemaOption,
} from '#/configs/interfaces/TDeleteSchemaOption';
import { getSchemaGeneratorOption } from '#/configs/modules/getSchemaGeneratorOption';
import { deleteDatabaseItem } from '#/databases/deleteDatabaseItem';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import { makeSQLDatabase } from '#/databases/files/makeSQLDatabase';
import type { ISchemaRecord } from '#/databases/interfaces/ISchemaRecord';
import { makeRepository } from '#/databases/repository/makeRepository';
import type { SchemaRepository } from '#/databases/repository/schemas/SchemaRepository';
import { getDeleteTypes } from '#/modules/cli/tools/getDeleteTypes';
import { container } from '#/modules/containers/container';
import { REPOSITORY_SCHEMAS_SYMBOL_KEY } from '#/modules/containers/keys';
import type * as tsm from 'ts-morph';
import { getImportInfoMap, type getTypeScriptConfig } from 'ts-morph-short';

export async function deleting(
  project: tsm.Project,
  _tsconfig: ReturnType<typeof getTypeScriptConfig>,
  baseOption: TDeleteSchemaBaseOption,
) {
  const spinner = makeSpinner();
  const resolvedPaths = getResolvedPaths(baseOption);

  const option: TDeleteSchemaOption = {
    ...baseOption,
    ...resolvedPaths,
    multiple: true,
    $kind: 'delete-schema',
    generatorOptionObject: {},
  };

  option.generatorOptionObject = await getSchemaGeneratorOption(option);

  const diagnostics = getDiagnostics({ option, project });

  if (diagnostics.type === 'fail') throw diagnostics.fail;
  if (diagnostics.pass === false) throw new Error('project compile error');

  const dbPath = await getDatabaseFilePath(option);

  await makeSQLDatabase(dbPath);
  makeRepository();

  const schemasRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
  const schemaTypes = await schemasRepo.types();
  const targetTypes = await getDeleteTypes({ schemaTypes, option });
  if (targetTypes.type === 'fail') throw targetTypes.fail;
  const importMap = getImportInfoMap(project);

  spinner.start(
    `Start [${targetTypes.pass.map((targetType) => `"${targetType}"`).join(', ')}] deletion...`,
  );

  const nextRefItems = (
    await Promise.all(
      targetTypes.pass.map((targetType) =>
        deleteDatabaseItem(project, option, importMap, targetType),
      ),
    )
  )
    .filter((refItems): refItems is ISchemaRecord[] => refItems != null)
    .flat();

  // mergeDatabaseItems(nextRefItems);
  // await lokidb().save();

  spinner.stop(
    `Start [${targetTypes.pass.map((targetType) => `"${targetType}"`).join(', ')}] deleted`,
    'succeed',
  );
}
