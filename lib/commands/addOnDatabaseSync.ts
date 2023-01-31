import spinner from '#cli/spinner';
import getDiagnostics from '#compilers/getDiagnostics';
import getTsProject from '#compilers/getTsProject';
import getResolvedPaths from '#configs/getResolvedPaths';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import readGeneratorOption from '#configs/readGeneratorOption';
import openDatabase from '#databases/openDatabase';
import saveDatabase from '#databases/saveDatabase';
import createJSONSchema from '#modules/createJSONSchema';
import createSchemaRecord from '#modules/createSchemaRecord';
import getAddFiles from '#modules/getAddFiles';
import getAddTypes from '#modules/getAddTypes';
import type IDatabaseRecord from '#modules/interfaces/IDatabaseRecord';
import mergeSchemaRecords from '#modules/mergeSchemaRecords';
import { isError } from 'my-easy-fp';

export default async function addOnDatabaseSync(
  nullableOption: TAddSchemaOption,
  isMessage?: boolean,
): Promise<void> {
  try {
    spinner.isEnable = isMessage ?? false;
    spinner.start('TypeScript source code compile, ...');

    const resolvedPaths = getResolvedPaths(nullableOption);
    const project = await getTsProject({
      tsConfigFilePath: resolvedPaths.project,
      skipAddingFilesFromTsConfig: false,
      skipFileDependencyResolution: true,
      skipLoadingLibFiles: true,
    });
    if (project.type === 'fail') throw project.fail;

    spinner.update({ message: 'TypeScript source code compile success', channel: 'succeed' });

    const files = await getAddFiles({ resolvedPaths, option: nullableOption });
    if (files.type === 'fail') throw files.fail;

    const diagnostics = getDiagnostics({ option: nullableOption, project: project.pass });
    if (diagnostics.type === 'fail') throw diagnostics.fail;

    const targetTypes = await getAddTypes({
      project: project.pass,
      option: { ...nullableOption, files: files.pass },
    });
    if (targetTypes.type === 'fail') throw targetTypes.fail;

    const option: TAddSchemaOption = {
      ...nullableOption,
      files: files.pass,
      types: targetTypes.pass.map((typeName) => typeName.typeName),
    };

    spinner.start('Open database, ...');

    const db = await openDatabase(resolvedPaths);
    const generatorOption = await readGeneratorOption(option);

    spinner.update({ message: 'database open success', channel: 'succeed' });
    spinner.start('Schema generation start, ...');

    const newRecords = (
      await Promise.all(
        targetTypes.pass.map(async (targetType) => {
          const schema = createJSONSchema({
            option,
            schemaConfig: generatorOption,
            filePath: targetType.filePath,
            typeName: targetType.typeName,
          });

          if (schema.type === 'fail') {
            return undefined;
          }

          const record = await createSchemaRecord({
            option,
            project: project.pass,
            resolvedPaths,
            metadata: schema.pass,
          });

          const records = [record.record, ...(record.definitions ?? [])];

          return records;
        }),
      )
    )
      .flat()
      .filter((record): record is IDatabaseRecord => record != null);

    const newDb = mergeSchemaRecords(db, newRecords);
    await saveDatabase(option, newDb);

    spinner.stop({
      message: `[${targetTypes.pass
        .map((targetType) => `"${targetType.typeName}"`)
        .join(', ')}] add complete`,
      channel: 'succeed',
    });
  } catch (catched) {
    spinner.stop({ message: 'Error occured...', channel: 'fail' });
    const err = isError(catched) ?? new Error('Unknown error raised');
    throw err;
  }
}
