import getDiagnostics from '@compilers/getDiagnostics';
import getTsProject from '@compilers/getTsProject';
import getResolvedPaths from '@configs/getResolvedPaths';
import IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import openDatabase from '@databases/openDatabase';
import saveDatabase from '@databases/saveDatabase';
import getDeleteTypes from '@modules/getDeleteTypes';
import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import fastCopy from 'fast-copy';

// import logger from '@tools/logger';
// const log = logger();

export default async function deleteOnDatabase(nullableOption: IDeleteSchemaOption) {
  const resolvedPaths = getResolvedPaths(nullableOption);
  const db = await openDatabase(nullableOption);

  const project = await getTsProject(resolvedPaths.project);

  if (project.type === 'fail') throw project.fail;

  const diagnostics = getDiagnostics({ option: nullableOption, project: project.pass });

  if (diagnostics.type === 'fail') throw diagnostics.fail;

  const types = await getDeleteTypes({ db, option: { ...nullableOption } });

  if (types.type === 'fail') throw types.fail;

  const option: IDeleteSchemaOption = { ...nullableOption, types: types.pass };

  const newDb = option.types.reduce<Record<string, IDatabaseRecord | undefined>>(
    (aggregation, typeName) => {
      if (aggregation[typeName] != null) {
        return { ...aggregation, [typeName]: undefined };
      }

      return { ...aggregation };
    },
    fastCopy(db),
  );

  await saveDatabase(option, newDb);
}
