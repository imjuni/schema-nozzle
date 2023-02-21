import spinner from '#cli/display/spinner';
import getDiagnostics from '#compilers/getDiagnostics';
import getExportedTypes from '#compilers/getExportedTypes';
import getTsProject from '#compilers/getTsProject';
import getResolvedPaths from '#configs/getResolvedPaths';
import getSchemaGeneratorOption from '#configs/getSchemaGeneratorOption';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type { TAddSchemaBaseOption } from '#configs/interfaces/TAddSchemaOption';
import createDatabaseItem from '#databases/createDatabaseItem';
import mergeDatabaseItems from '#databases/mergeDatabaseItems';
import openDatabase from '#databases/openDatabase';
import saveDatabase from '#databases/saveDatabase';
import createJSONSchema from '#modules/createJSONSchema';
import getAddFiles from '#modules/getAddFiles';
import getAddTypes from '#modules/getAddTypes';
import type IDatabaseItem from '#modules/interfaces/IDatabaseItem';
import summarySchemaFiles from '#modules/summarySchemaFiles';
import summarySchemaTypes from '#modules/summarySchemaTypes';
import { isError } from 'my-easy-fp';
import * as tjsg from 'ts-json-schema-generator';

export default async function addOnDatabaseSync(baseOption: TAddSchemaBaseOption): Promise<void> {
  try {
    spinner.start('TypeScript source code compile, ...');

    const resolvedPaths = getResolvedPaths(baseOption);
    const option: TAddSchemaOption = {
      ...baseOption,
      ...resolvedPaths,
      discriminator: 'add-schema',
      generatorOptionObject: {},
    };

    option.generatorOptionObject = await getSchemaGeneratorOption(option);

    const project = await getTsProject({ tsConfigFilePath: resolvedPaths.project });
    if (project.type === 'fail') throw project.fail;

    const projectExportedTypes = getExportedTypes(project.pass);
    const diagnostics = getDiagnostics({ option, project: project.pass });
    if (diagnostics.type === 'fail') throw diagnostics.fail;
    if (diagnostics.pass === false) throw new Error('project compile error');

    spinner.update({ message: 'TypeScript project file loaded', channel: 'succeed' });

    const summariedSchemaFiles = await summarySchemaFiles(project.pass, option);
    const selectedFiles = await getAddFiles(option, summariedSchemaFiles.filePaths);
    if (selectedFiles.type === 'fail') throw selectedFiles.fail;
    option.files = selectedFiles.pass.map((file) => file.origin);
    const schemaFiles = await summarySchemaFiles(project.pass, option);

    const summariedSchemaTypes = await summarySchemaTypes(project.pass, option, schemaFiles.filter);
    const selectedTypes = await getAddTypes(option, summariedSchemaTypes);
    if (selectedTypes.type === 'fail') throw selectedTypes.fail;
    option.types = selectedTypes.pass.map((exportedType) => exportedType.identifier);
    const schemaTypes = await summarySchemaTypes(project.pass, option, schemaFiles.filter);

    const generator = tjsg.createGenerator(option.generatorOptionObject);

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

        const item = createDatabaseItem(option, projectExportedTypes, schema.pass);
        const withDependencies = [item.item, ...(item.definitions ?? [])];

        return withDependencies;
      })
      .flat()
      .filter((record): record is IDatabaseItem => record != null);

    const db = await openDatabase(option);
    const newDb = mergeDatabaseItems(db, items);
    await saveDatabase(option, newDb);

    spinner.stop({
      message: `[${selectedTypes.pass
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
