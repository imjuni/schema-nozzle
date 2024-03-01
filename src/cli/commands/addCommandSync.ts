import { spinner } from '#/cli/display/spinner';
import { getDiagnostics } from '#/compilers/getDiagnostics';
import { getExportedTypes } from '#/compilers/getExportedTypes';
import { getResolvedPaths } from '#/configs/getResolvedPaths';
import { getSchemaGeneratorOption } from '#/configs/getSchemaGeneratorOption';
import type { TAddSchemaBaseOption, TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import { createDatabaseItem } from '#/databases/createDatabaseItem';
import { mergeDatabaseItems } from '#/databases/mergeDatabaseItems';
import { openDatabase } from '#/databases/openDatabase';
import { saveDatabase } from '#/databases/saveDatabase';
import { createJSONSchema } from '#/modules/createJSONSchema';
import { getAddFiles } from '#/modules/getAddFiles';
import { getAddTypes } from '#/modules/getAddTypes';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import { summarySchemaFiles } from '#/modules/summarySchemaFiles';
import { summarySchemaTypes } from '#/modules/summarySchemaTypes';
import { showLogo } from '@maeum/cli-logo';
import { isError } from 'my-easy-fp';
import { createGenerator } from 'ts-json-schema-generator';
import { getTypeScriptProject } from 'ts-morph-short';

export async function addCommandSync(baseOption: TAddSchemaBaseOption): Promise<void> {
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
    const option: TAddSchemaOption = {
      ...baseOption,
      ...resolvedPaths,
      discriminator: 'add-schema',
      generatorOptionObject: {},
    };

    option.generatorOptionObject = await getSchemaGeneratorOption(option);

    const project = getTypeScriptProject(resolvedPaths.project);
    const projectExportedTypes = getExportedTypes(project, []);
    const diagnostics = getDiagnostics({ option, project });
    if (diagnostics.type === 'fail') throw diagnostics.fail;
    if (diagnostics.pass === false) throw new Error('project compile error');

    spinner.stop('TypeScript project file loaded', 'succeed');

    const summariedSchemaFiles = await summarySchemaFiles(project, option);
    const selectedFiles = await getAddFiles(option, summariedSchemaFiles.filePaths);
    if (selectedFiles.type === 'fail') throw selectedFiles.fail;
    option.files = selectedFiles.pass.map((file) => file.origin);
    // const schemaFiles = await summarySchemaFiles(project, option);

    const summariedSchemaTypes = await summarySchemaTypes(project, [], option);
    const selectedTypes = await getAddTypes(option, summariedSchemaTypes);
    if (selectedTypes.type === 'fail') throw selectedTypes.fail;
    option.types = selectedTypes.pass.map((exportedType) => exportedType.identifier);
    const schemaTypes = await summarySchemaTypes(project, [], option);

    const generator = createGenerator(option.generatorOptionObject);

    const items = schemaTypes
      .map((selectedType) => {
        const schema = createJSONSchema({
          filePath: selectedType.filePath,
          exportedType: selectedType.identifier,
          generator,
        });

        if (schema.type === 'fail') {
          return undefined;
        }

        const item = createDatabaseItem(project, option, projectExportedTypes, schema.pass);
        const withDependencies = [item.item, ...(item.definitions ?? [])];

        return withDependencies;
      })
      .flat()
      .filter((record): record is IDatabaseItem => record != null);

    const db = await openDatabase(option);
    const newDb = mergeDatabaseItems(db, items);
    await saveDatabase(option, newDb);

    spinner.stop(
      `[${selectedTypes.pass
        .map((targetType) => `"${targetType.identifier}"`)
        .join(', ')}] add complete`,
      'succeed',
    );
  } catch (caught) {
    spinner.stop('Error occured...', 'fail');
    const err = isError(caught, new Error('Unknown error raised'));
    throw err;
  }
}
