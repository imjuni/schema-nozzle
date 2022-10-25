import spinner from '@cli/spinner';
import getDiagnostics from '@compilers/getDiagnostics';
import getTsProject from '@compilers/getTsProject';
import getResolvedPaths from '@configs/getResolvedPaths';
import IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import openDatabase from '@databases/openDatabase';
import saveScheams from '@databases/saveScheams';
import createJSONSchema from '@modules/createJSONSchema';
import createSchemaRecord from '@modules/createSchemaRecord';
import mergeSchemaRecord from '@modules/mergeSchemaRecord';
import { isError } from 'my-easy-fp';
import { TPickIPass } from 'my-only-either';

export default async function refreshOnDatabase(option: IRefreshSchemaOption, isMessage?: boolean) {
  try {
    spinner.isEnable = isMessage ?? false;

    const resolvedPaths = getResolvedPaths(option);
    const db = await openDatabase(resolvedPaths);

    const project = await getTsProject(resolvedPaths.project);

    if (project.type === 'fail') throw project.fail;

    const diagnostics = getDiagnostics({ option, project: project.pass });

    if (diagnostics.type === 'fail') throw diagnostics.fail;

    const targetTypes = Object.values(db).map((record) => {
      return {
        filePath: record.filePath,
        typeName: record.id,
      };
    });

    spinner.start('Start schema generation!');

    const schemas = targetTypes.map((targetType) => {
      const schema = createJSONSchema({
        option,
        schemaConfig: undefined,
        filePath: targetType.filePath,
        typeName: targetType.typeName,
      });

      spinner.update({ message: `generate schema: ${targetType.typeName}`, channel: 'info' });
      return schema;
    });

    const records = (
      await Promise.all(
        schemas
          .filter(
            (schema): schema is TPickIPass<ReturnType<typeof createJSONSchema>> =>
              schema.type === 'pass',
          )
          .map((schema) => schema.pass)
          .map(async (schema) =>
            createSchemaRecord({ project: project.pass, resolvedPaths, metadata: schema }),
          ),
      )
    )
      .map((schema) => [schema.record, ...(schema.definitions ?? [])])
      .flat()
      .map((schema) => mergeSchemaRecord(db, schema));

    await saveScheams(option, db, ...records);

    spinner.stop({
      message: `[${targetTypes
        .map((targetType) => `"${targetType.typeName}"`)
        .join(', ')}] refresh complete`,
      channel: 'succeed',
    });
  } catch (catched) {
    spinner.stop({ message: 'Error occured...', channel: 'fail' });
    const err = isError(catched) ?? new Error('Unknown error raised');
    throw err;
  }
}
