import spinner from '#cli/display/spinner';
import getDiagnostics from '#compilers/getDiagnostics';
import getExportedTypes from '#compilers/getExportedTypes';
import getTsProject from '#compilers/getTsProject';
import getResolvedPaths from '#configs/getResolvedPaths';
import getSchemaGeneratorOption from '#configs/getSchemaGeneratorOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import type { TRefreshSchemaBaseOption } from '#configs/interfaces/TRefreshSchemaOption';
import createDatabaseItem from '#databases/createDatabaseItem';
import mergeDatabaseItems from '#databases/mergeDatabaseItems';
import openDatabase from '#databases/openDatabase';
import saveDatabase from '#databases/saveDatabase';
import createJSONSchema from '#modules/createJSONSchema';
import getSchemaFilterFilePath from '#modules/getSchemaFilterFilePath';
import type IDatabaseItem from '#modules/interfaces/IDatabaseItem';
import summarySchemaFiles from '#modules/summarySchemaFiles';
import summarySchemaTypes from '#modules/summarySchemaTypes';
import { showLogo } from '@maeum/cli-logo';
import { isError } from 'my-easy-fp';
import { getDirname } from 'my-node-fp';
import path from 'path';
import * as tjsg from 'ts-json-schema-generator';
import type { SetRequired } from 'type-fest';

export default async function refreshOnDatabaseSync(baseOption: TRefreshSchemaBaseOption) {
  try {
    if (baseOption.cliLogo) {
      await showLogo({
        message: 'Schema Nozzle',
        figlet: { font: 'ANSI Shadow', width: 80 },
        color: 'cyan',
      });
    } else {
      spinner.start('Schema Nozzle start');
      spinner.update({ message: 'Schema Nozzle start', channel: 'info' });
      spinner.stop();
    }

    spinner.start('TypeScript source code compile, ...');

    const resolvedPaths = getResolvedPaths(baseOption);
    const option: TRefreshSchemaOption = {
      ...baseOption,
      ...resolvedPaths,
      discriminator: 'refresh-schema',
      files: [],
      generatorOptionObject: {},
    };

    option.generatorOptionObject = await getSchemaGeneratorOption(option);

    const project = await getTsProject({ tsConfigFilePath: option.project });
    if (project.type === 'fail') throw project.fail;

    const projectExportedTypes = getExportedTypes(project.pass);
    const diagnostics = getDiagnostics({ option, project: project.pass });
    if (diagnostics.type === 'fail') throw diagnostics.fail;
    if (diagnostics.pass === false) throw new Error('project compile error');

    spinner.update({ message: 'TypeScript project file loaded', channel: 'succeed' });

    const db = await openDatabase(option);
    const basePath = await getDirname(resolvedPaths.project);

    const schemaFilterFilePath = await getSchemaFilterFilePath(option.cwd, option.listFile);

    if (schemaFilterFilePath == null) {
      const exportedTypesInDb = Object.values(db)
        .filter(
          (record): record is SetRequired<IDatabaseItem, 'filePath'> => record.filePath != null,
        )
        .map((record) => {
          return {
            filePath: path.join(basePath, record.filePath),
            identifier: record.id,
          };
        });

      option.types = exportedTypesInDb.map((exportedType) => exportedType.identifier);
      option.files = exportedTypesInDb.map((exportedType) => exportedType.filePath);
    }

    if (schemaFilterFilePath == null && option.files.length <= 0 && option.types.length <= 0) {
      spinner.start();
      spinner.update({ message: 'Cannot found .nozzlefiles and empty database', channel: 'fail' });
      return;
    }

    const schemaFiles = await summarySchemaFiles(project.pass, option);
    const schemaTypes = await summarySchemaTypes(project.pass, option, schemaFiles.filter);
    const generator = tjsg.createGenerator(option.generatorOptionObject);

    const items = (
      await Promise.all(
        schemaTypes.map(async (targetType) => {
          const schema = createJSONSchema({
            filePath: targetType.filePath,
            exportedType: targetType.identifier,
            generator,
          });

          if (schema.type === 'fail') {
            return undefined;
          }

          const item = createDatabaseItem(option, projectExportedTypes, schema.pass);
          const withDependencies = [item.item, ...(item.definitions ?? [])];

          return withDependencies;
        }),
      )
    )
      .flat()
      .filter((record): record is IDatabaseItem => record != null);

    const newDb = mergeDatabaseItems(db, items);
    await saveDatabase(option, newDb);

    spinner.stop({
      message: `[${schemaTypes
        .map((targetType) => `"${targetType.identifier}"`)
        .join(', ')}] add complete`,
      channel: 'succeed',
    });
  } catch (caught) {
    spinner.stop({ message: 'Error occured...', channel: 'fail' });
    const err = isError(caught) ?? new Error('Unknown error raised');
    throw err;
  }
}
