import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import type getExportedTypes from '#compilers/getExportedTypes';
import type TWatchSchemaOption from '#configs/interfaces/TWatchSchemaOption';
import createDatabaseItem from '#databases/createDatabaseItem';
import deleteDatabaseItemsByFile from '#databases/deleteDatabaseItemsByFile';
import mergeDatabaseItems from '#databases/mergeDatabaseItems';
import openDatabase from '#databases/openDatabase';
import saveDatabase from '#databases/saveDatabase';
import createJSONSchema from '#modules/createJSONSchema';
import type IDatabaseItem from '#modules/interfaces/IDatabaseItem';
import type IWatchEvent from '#modules/interfaces/IWatchEvent';
import type { TDatabase } from '#modules/interfaces/TDatabase';
import summarySchemaFiles from '#modules/summarySchemaFiles';
import summarySchemaTypes from '#modules/summarySchemaTypes';
import logger from '#tools/logger';
import fastCopy from 'fast-copy';
import { last } from 'my-easy-fp';
import path from 'path';
import * as tjsg from 'ts-json-schema-generator';
import type * as tsm from 'ts-morph';
import type { LastArrayElement } from 'type-fest';

const log = logger();

export default class WatcherModule {
  #project: tsm.Project;

  #option: TWatchSchemaOption;

  #exportTypes: Pick<
    LastArrayElement<ReturnType<typeof getExportedTypes>>,
    'filePath' | 'identifier'
  >[];

  #generator: tjsg.SchemaGenerator;

  constructor(args: {
    project: tsm.Project;
    option: TWatchSchemaOption;
    exportTypes: Pick<
      LastArrayElement<ReturnType<typeof getExportedTypes>>,
      'filePath' | 'identifier'
    >[];
  }) {
    this.#project = args.project;
    this.#option = args.option;
    this.#exportTypes = args.exportTypes;
    this.#generator = tjsg.createGenerator(args.option.generatorOptionObject);
  }

  async bulk(events: IWatchEvent[]) {
    const option = fastCopy(this.#option);
    const files = events.map((event) => path.join(option.cwd, event.filePath));

    this.#generator = tjsg.createGenerator(this.#option.generatorOptionObject);

    const updateFiles = files.filter((file) => this.#project.getSourceFile(file) != null);
    const deleteFiles = files.filter((file) => this.#project.getSourceFile(file) == null);

    if (updateFiles.length > 0) {
      option.files = updateFiles;

      spinner.start('schema file select, ...');
      const schemaFiles = await summarySchemaFiles(this.#project, option);
      spinner.stop('schema file select complete', 'succeed');

      spinner.start('schema type select, ...');
      const schemaTypes = await summarySchemaTypes(this.#project, option, schemaFiles.filter);
      spinner.stop(`${schemaTypes.length} schema type select complete`, 'succeed');

      progress.start(schemaTypes.length, 0, '');

      const items = (
        await Promise.all(
          schemaTypes.map(async (targetType) => {
            const schema = createJSONSchema({
              filePath: targetType.filePath,
              exportedType: targetType.identifier,
              generator: this.#generator,
            });

            if (schema.type === 'fail') {
              return undefined;
            }

            const item = createDatabaseItem(option, this.#exportTypes, schema.pass);
            const withDependencies = [item.item, ...(item.definitions ?? [])];

            progress.increment(targetType.identifier);

            return withDependencies;
          }),
        )
      )
        .flat()
        .filter((item): item is IDatabaseItem => item != null);

      progress.update(schemaTypes.length, last(schemaTypes).identifier);
      progress.stop();

      await this.updateDatabase(items);
    }

    if (deleteFiles.length > 0) {
      await this.deleteDatabase(deleteFiles);
    }
  }

  async add(event: IWatchEvent): Promise<IDatabaseItem[]> {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    log.trace(`received: ${resolved}`);

    this.#project.addSourceFileAtPath(resolved);
    option.files = [resolved];

    this.#generator = tjsg.createGenerator(this.#option.generatorOptionObject);

    const schemaFiles = await summarySchemaFiles(this.#project, option);
    const schemaTypes = await summarySchemaTypes(this.#project, option, schemaFiles.filter);

    const items = (
      await Promise.all(
        schemaTypes.map(async (targetType) => {
          const schema = createJSONSchema({
            filePath: targetType.filePath,
            exportedType: targetType.identifier,
            generator: this.#generator,
          });

          if (schema.type === 'fail') {
            return undefined;
          }

          const item = createDatabaseItem(option, this.#exportTypes, schema.pass);
          const withDependencies = [item.item, ...(item.definitions ?? [])];
          return withDependencies;
        }),
      )
    )
      .flat()
      .filter((item): item is IDatabaseItem => item != null);

    log.trace(`add new: ${items.length}, ${items.map((item) => item.id).join(', ')}`);

    return items;
  }

  async change(event: IWatchEvent) {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    log.trace(`received: ${resolved}`);

    // change event file is tsconfig.json terminate watch process
    const sourceFile = this.#project.getSourceFile(resolved);

    if (sourceFile == null) {
      return;
    }

    await sourceFile.refreshFromFileSystem();
  }

  async unlink(event: IWatchEvent) {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    log.trace(`received: ${resolved}`);

    const sourceFile = this.#project.getSourceFile(resolved);

    if (sourceFile == null) {
      return;
    }

    this.#project.removeSourceFile(sourceFile);
  }

  async updateDatabase(items: IDatabaseItem[]) {
    const db = await openDatabase(this.#option);
    const newDb = mergeDatabaseItems(db, items);
    await saveDatabase(this.#option, newDb);
  }

  async deleteDatabase(filePaths: string[]) {
    const db = await openDatabase(this.#option);

    const newDb = filePaths.reduce<TDatabase>((deletingDb, filePath) => {
      const nextDb = deleteDatabaseItemsByFile(deletingDb, filePath);
      return nextDb;
    }, db);

    await saveDatabase(this.#option, newDb);
  }
}
