import getDiagnostics from '@compilers/getDiagnostics';
import getTsProject from '@compilers/getTsProject';
import getResolvedPaths from '@configs/getResolvedPaths';
import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import openDatabase from '@databases/openDatabase';
import saveScheams from '@databases/saveScheams';
import createJSONSchema from '@modules/createJSONSchema';
import createSchemaRecord from '@modules/createSchemaRecord';
import getAddFiles from '@modules/getAddFiles';
import getAddTypes from '@modules/getAddTypes';
import getTargetTypes from '@modules/getTargetTypes';
import mergeSchemaRecord from '@modules/mergeSchemaRecord';
import { TPickIPass } from 'my-only-either';

export default async function addOnDatabase(nullableOption: IAddSchemaOption) {
  const resolvedPaths = getResolvedPaths(nullableOption);
  const project = await getTsProject(resolvedPaths.project);

  if (project.type === 'fail') throw project.fail;

  const files = await getAddFiles({ resolvedPaths, option: nullableOption });

  if (files.type === 'fail') throw files.fail;

  const diagnostics = getDiagnostics({ option: nullableOption, project: project.pass });

  if (diagnostics.type === 'fail') throw diagnostics.fail;

  const types = await getAddTypes({
    project: project.pass,
    option: { ...nullableOption, files: files.pass },
  });

  if (types.type === 'fail') throw types.fail;

  const option: IAddSchemaOption = { ...nullableOption, files: files.pass, types: types.pass };

  const targetTypes = getTargetTypes({ project: project.pass, option });

  const db = await openDatabase(option);

  const schemas = targetTypes.exportedTypes.map((targetType) =>
    createJSONSchema({
      option,
      schemaConfig: undefined,
      type: targetType.type,
      filePath: targetType.filePath,
      typeName: targetType.identifier,
    }),
  );

  const validSchemas = schemas
    .filter(
      (schema): schema is TPickIPass<ReturnType<typeof createJSONSchema>> => schema.type === 'pass',
    )
    .map((schema) => schema.pass)
    .map((schema) => createSchemaRecord({ schemaMetadata: schema }))
    .map((schema) => [schema.record, ...(schema.definitions ?? [])])
    .flat()
    .map((schema) => mergeSchemaRecord(db, schema));

  await saveScheams(option, ...validSchemas);

  return schemas;
}
