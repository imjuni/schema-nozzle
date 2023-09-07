import { showLogo } from '@maeum/cli-logo';
import { exists } from 'find-up';
import { isError, sleep } from 'my-easy-fp';
import { getDirname } from 'my-node-fp';
import fs from 'node:fs';
import path from 'node:path';
import spinner from 'src/cli/display/spinner';
import getDiagnostics from 'src/compilers/getDiagnostics';
import getExportedTypes from 'src/compilers/getExportedTypes';
import getTsProject from 'src/compilers/getTsProject';
import getResolvedPaths from 'src/configs/getResolvedPaths';
import getSchemaGeneratorOption from 'src/configs/getSchemaGeneratorOption';
import type TRefreshSchemaOption from 'src/configs/interfaces/TRefreshSchemaOption';
import type { TRefreshSchemaBaseOption } from 'src/configs/interfaces/TRefreshSchemaOption';
import createDatabaseItem from 'src/databases/createDatabaseItem';
import getDatabaseFilePath from 'src/databases/getDatabaseFilePath';
import mergeDatabaseItems from 'src/databases/mergeDatabaseItems';
import openDatabase from 'src/databases/openDatabase';
import saveDatabase from 'src/databases/saveDatabase';
import createJSONSchema from 'src/modules/createJSONSchema';
import getSchemaFilterFilePath from 'src/modules/getSchemaFilterFilePath';
import type IDatabaseItem from 'src/modules/interfaces/IDatabaseItem';
import summarySchemaFiles from 'src/modules/summarySchemaFiles';
import summarySchemaTypes from 'src/modules/summarySchemaTypes';
import { createGenerator } from 'ts-json-schema-generator';
import type { SetRequired } from 'type-fest';

export default async function refreshCommandSync(baseOption: TRefreshSchemaBaseOption) {
  try {
    if (baseOption.cliLogo) {
      await showLogo({
        message: 'Schema Nozzle',
        figlet: { font: 'ANSI Shadow', width: 80 },
        color: 'cyan',
      });
    } else {
      spinner.start('Schema Nozzle start');
      spinner.stop('Schema Nozzle start', 'info');
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
    const projectExportedTypes = getExportedTypes(project);
    const diagnostics = getDiagnostics({ option, project });

    if (diagnostics.type === 'fail') throw diagnostics.fail;
    if (diagnostics.pass === false) throw new Error('project compile error');

    spinner.stop('TypeScript project file loaded', 'succeed');

    const dbPath = await getDatabaseFilePath(option);
    if ((option.truncate ?? false) && (await exists(dbPath))) {
      spinner.start('database file truncate, ...');
      await fs.promises.unlink(dbPath);
      await sleep(200);
      spinner.stop('database file truncated', 'succeed');
    }

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
      spinner.stop('Cannot found .nozzlefiles and empty database', 'fail');
      return;
    }

    const schemaFiles = await summarySchemaFiles(project, option);
    const schemaTypes = await summarySchemaTypes(project, option, schemaFiles.filter);
    const generator = createGenerator(option.generatorOptionObject);

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

    spinner.stop(
      `[${schemaTypes.map((targetType) => `"${targetType.identifier}"`).join(', ')}] add complete`,
      'succeed',
    );
  } catch (caught) {
    spinner.stop('Error occured...', 'fail');
    const err = isError(caught, new Error('Unknown error raised'));
    throw err;
  }
}
