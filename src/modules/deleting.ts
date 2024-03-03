import { spinner } from '#/cli/display/spinner';
import { getDiagnostics } from '#/compilers/getDiagnostics';
import { getResolvedPaths } from '#/configs/getResolvedPaths';
import { getSchemaGeneratorOption } from '#/configs/getSchemaGeneratorOption';
import type {
  IDeleteSchemaOption,
  TDeleteSchemaOption,
} from '#/configs/interfaces/TDeleteSchemaOption';
import { deleteDatabaseItem } from '#/databases/deleteDatabaseItem';
import { bootstrap as lokiBootstrap, container as lokidb } from '#/databases/files/LokiDbContainer';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import { types } from '#/databases/files/repository/types';
import { mergeDatabaseItems } from '#/databases/mergeDatabaseItems';
import { getDeleteTypes } from '#/modules/cli/getDeleteTypes';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import type * as tsm from 'ts-morph';
import type { getTypeScriptConfig } from 'ts-morph-short';

export async function deleting(
  project: tsm.Project,
  _tsconfig: ReturnType<typeof getTypeScriptConfig>,
  baseOption: IDeleteSchemaOption,
) {
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
  await lokiBootstrap({ filename: dbPath });

  const schemaTypes = types();
  const targetTypes = await getDeleteTypes({ schemaTypes, option });
  if (targetTypes.type === 'fail') throw targetTypes.fail;

  spinner.start(
    `Start [${targetTypes.pass.map((targetType) => `"${targetType}"`).join(', ')}] deletion...`,
  );

  const nextRefItems = targetTypes.pass
    .map((targetType) => deleteDatabaseItem(project, option, targetType))
    .filter((refItems): refItems is IDatabaseItem[] => refItems != null)
    .flat();

  mergeDatabaseItems(nextRefItems);
  await lokidb().save();

  spinner.stop(
    `Start [${targetTypes.pass.map((targetType) => `"${targetType}"`).join(', ')}] deleted`,
    'succeed',
  );
}
