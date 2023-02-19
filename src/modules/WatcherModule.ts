import type getExportedTypes from '#compilers/getExportedTypes';
import getSoruceFileExportedTypes from '#compilers/getSoruceFileExportedTypes';
import type TWatchSchemaOption from '#configs/interfaces/TWatchSchemaOption';
import createDatabaseItem from '#databases/createDatabaseItem';
import deleteDatabaseItem from '#databases/deleteDatabaseItem';
import mergeDatabaseItems from '#databases/mergeDatabaseItems';
import openDatabase from '#databases/openDatabase';
import saveDatabase from '#databases/saveDatabase';
import createJSONSchema from '#modules/createJSONSchema';
import type IDatabaseItem from '#modules/interfaces/IDatabaseItem';
import type IWatchEvent from '#modules/interfaces/IWatchEvent';
import summarySchemaFiles from '#modules/summarySchemaFiles';
import summarySchemaTypes from '#modules/summarySchemaTypes';
import logger from '#tools/logger';
import fastCopy from 'fast-copy';
import path from 'path';
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
  }

  async add(event: IWatchEvent): Promise<IDatabaseItem[]> {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    log.trace(`received: ${resolved}`);

    this.#project.addSourceFileAtPath(resolved);
    option.files = [resolved];

    const schemaFiles = await summarySchemaFiles(this.#project, option);
    const schemaTypes = await summarySchemaTypes(this.#project, option, schemaFiles.filter);

    const items = (
      await Promise.all(
        schemaTypes.map(async (targetType) => {
          const schema = createJSONSchema(
            targetType.filePath,
            targetType.identifier,
            option.generatorOptionObject,
          );

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

  async change(event: IWatchEvent): Promise<IDatabaseItem[]> {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    log.trace(`received: ${resolved}`);

    // change event file is tsconfig.json terminate watch process
    const sourceFile = this.#project.getSourceFile(resolved);

    if (sourceFile == null) {
      return [];
    }

    await sourceFile.refreshFromFileSystem();

    option.files = [resolved];

    const schemaFiles = await summarySchemaFiles(this.#project, option);
    const schemaTypes = await summarySchemaTypes(this.#project, option, schemaFiles.filter);

    const items = (
      await Promise.all(
        schemaTypes.map(async (targetType) => {
          const schema = createJSONSchema(
            targetType.filePath,
            targetType.identifier,
            option.generatorOptionObject,
          );

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
      .filter((record): record is IDatabaseItem => record != null);

    log.trace(`change: ${items.length}, ${items.map((item) => item.id).join(', ')}`);

    return items;
  }

  async unlink(
    event: IWatchEvent,
  ): Promise<
    Pick<LastArrayElement<ReturnType<typeof getExportedTypes>>, 'filePath' | 'identifier'>[]
  > {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    log.trace(`received: ${resolved}`);

    const sourceFile = this.#project.getSourceFile(resolved);

    if (sourceFile == null) {
      return [];
    }

    const exportedTypes = getSoruceFileExportedTypes(sourceFile);
    this.#project.removeSourceFile(sourceFile);

    log.trace(
      `delete: ${exportedTypes.length}, ${exportedTypes.map((item) => item.identifier).join(', ')}`,
    );

    return exportedTypes.map((exportedType) => ({
      filePath: exportedType.filePath,
      identifier: exportedType.identifier,
    }));
  }

  async updateDatabase(items: IDatabaseItem[]) {
    const db = await openDatabase(this.#option);
    const newDb = mergeDatabaseItems(db, items);
    await saveDatabase(this.#option, newDb);
  }

  async deleteDatabase(
    exportedTypes: Pick<
      LastArrayElement<ReturnType<typeof getExportedTypes>>,
      'filePath' | 'identifier'
    >[],
  ) {
    const db = await openDatabase(this.#option);
    const newDb = exportedTypes.reduce((aggregation, item) => {
      const items = deleteDatabaseItem(aggregation, item.identifier);
      return items;
    }, fastCopy(db));
    await saveDatabase(this.#option, newDb);
  }
}
