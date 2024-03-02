import { spinner } from '#/cli/display/spinner';
import { getDiagnostics } from '#/compilers/getDiagnostics';
import { getResolvedPaths } from '#/configs/getResolvedPaths';
import type {
  IDeleteSchemaOption,
  TDeleteSchemaOption,
} from '#/configs/interfaces/TDeleteSchemaOption';
import { bootstrap as lokiBootstrap, instance as lokidb } from '#/databases/files/LokiDb';
import { getDatabaseFilePath } from '#/databases/files/getDatabaseFilePath';
import { getDeleteTypes } from '#/modules/cli/getDeleteTypes';
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
    discriminator: 'delete-schema',
  };

  const diagnostics = getDiagnostics({ option, project });

  if (diagnostics.type === 'fail') throw diagnostics.fail;
  if (diagnostics.pass === false) throw new Error('project compile error');

  const dbPath = await getDatabaseFilePath(option);
  await lokiBootstrap({ filename: dbPath });

  const schemaTypes = lokidb().types();
  const targetTypes = await getDeleteTypes({ schemaTypes, option: { ...baseOption } });
  if (targetTypes.type === 'fail') throw targetTypes.fail;

  spinner.start(
    `Start [${targetTypes.pass.map((targetType) => `"${targetType}"`).join(', ')}] deletion...`,
  );

  lokidb().remove(targetTypes.pass);
  await lokidb().save();

  spinner.stop(
    `Start [${targetTypes.pass.map((targetType) => `"${targetType}"`).join(', ')}] deleted`,
    'succeed',
  );
}
