/* eslint-disable max-classes-per-file */
import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import deepmerge, { type ArrayMergeOptions } from 'deepmerge';
import fastCopy from 'fast-copy';
import { isPlainObject } from 'is-plain-object';
import Lokijs from 'lokijs';
import { settify, toArray } from 'my-easy-fp';

export class LokiDb {
  #loki: Lokijs;

  constructor(lokidb: Lokijs) {
    this.#loki = lokidb;

    const collection = this.#loki.getCollection<IDatabaseItem>(CE_DEFAULT_VALUE.DB_COLLECTION_NAME);

    if (collection == null) {
      this.#loki.addCollection<IDatabaseItem>(CE_DEFAULT_VALUE.DB_COLLECTION_NAME, {
        cloneMethod: 'parse-stringify',
        unique: ['id'],
        indices: ['id'],
      });
    }
  }

  insert(items: IDatabaseItem | IDatabaseItem[]) {
    const collection = this.#loki.getCollection<IDatabaseItem>(CE_DEFAULT_VALUE.DB_COLLECTION_NAME);
    collection.insert(items);
  }

  update(items: IDatabaseItem) {
    const collection = this.#loki.getCollection<IDatabaseItem>(CE_DEFAULT_VALUE.DB_COLLECTION_NAME);
    collection.update(items);
  }

  remove(ids: string | string[]) {
    const collection = this.#loki.getCollection<IDatabaseItem>(CE_DEFAULT_VALUE.DB_COLLECTION_NAME);
    const items = collection.find({ id: { $in: toArray(ids) } });
    collection.remove(items);
  }

  find(id: string): IDatabaseItem | undefined {
    const collection = this.#loki.getCollection<IDatabaseItem>(CE_DEFAULT_VALUE.DB_COLLECTION_NAME);
    const item = collection.findOne({ id: { $eq: id } });

    if (item == null) {
      return undefined;
    }

    return item;
  }

  types() {
    const collection = this.#loki.getCollection<IDatabaseItem>(CE_DEFAULT_VALUE.DB_COLLECTION_NAME);
    const items = collection.find();
    return items.map((item) => ({ id: item.id, filePath: item.filePath }));
  }

  merge(items: IDatabaseItem | IDatabaseItem[]) {
    const targetItems = toArray(items);

    targetItems.forEach((item) => {
      const prevItem = this.find(item.id);

      if (prevItem == null) {
        this.insert(item);
      } else {
        const nextRecord = fastCopy(item);

        // nextRecord.dependency.import = {
        const importInfo = {
          name: item.dependency.import.name,
          from: settify([...prevItem.dependency.import.from, ...nextRecord.dependency.import.from]),
        };

        // nextRecord.dependency.export = {
        const exportInfo = {
          name: item.dependency.export.name,
          to: settify([...prevItem.dependency.export.to, ...nextRecord.dependency.export.to]),
        };

        const merged = deepmerge(prevItem, nextRecord, {
          isMergeableObject: isPlainObject,
          arrayMerge: (
            target: IDatabaseItem[],
            source: IDatabaseItem[],
            options: ArrayMergeOptions,
          ) => {
            const destination = target.slice();

            source.forEach(($item, index) => {
              if (destination[index] == null) {
                destination[index] = options.cloneUnlessOtherwiseSpecified(
                  $item,
                  options,
                ) as IDatabaseItem;
              } else if (options.isMergeableObject($item)) {
                destination[index] = deepmerge(
                  target[index] ?? {},
                  $item,
                  options,
                ) as IDatabaseItem;
              } else if (target.includes($item)) {
                destination.push($item);
              }
            });

            return settify(destination);
          },
        });

        merged.dependency.import = importInfo;
        merged.dependency.export = exportInfo;

        this.update(merged);
      }
    });
  }

  save() {
    return new Promise<void>((resolve, reject) => {
      this.#loki.save((err) => {
        if (err != null) {
          return reject(err);
        }

        return resolve();
      });
    });
  }
}

let it: LokiDb;

let isBootstrap: boolean = false;

export function instance(): Readonly<LokiDb> {
  return it;
}

export async function bootstrap(options: { filename: string }) {
  if (isBootstrap) {
    return;
  }

  const db = await new Promise<Lokijs>((resolve, reject) => {
    const lokidb = new Lokijs(options.filename, {
      env: 'NODEJS',
      autoload: true,
      persistenceMethod: 'fs',
      serializationMethod: 'pretty',
      autoloadCallback(err) {
        if (err != null) {
          reject(err);
          return;
        }

        resolve(lokidb);
      },
    });
  });

  it = new LokiDb(db);
  isBootstrap = true;
}
