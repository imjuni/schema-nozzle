import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import Lokijs from 'lokijs';

export class LokiDb {
  static #it: LokiDb;

  static #isBootstrap: boolean;

  public static get it(): Readonly<LokiDb> {
    return LokiDb.#it;
  }

  static bootstrap(options: { filename: string }) {
    if (LokiDb.#isBootstrap) {
      return;
    }

    LokiDb.#it = new LokiDb(options.filename);
  }

  #loki: Lokijs;

  constructor(filename: string) {
    this.#loki = new Lokijs(filename, {
      env: 'NODEJS',
      persistenceMethod: 'fs',
      serializationMethod: 'pretty',
    });

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

  find(id: string): IDatabaseItem | undefined {
    const collection = this.#loki.getCollection<IDatabaseItem>(CE_DEFAULT_VALUE.DB_COLLECTION_NAME);
    const item = collection.findOne({ id: { $eq: id } });

    if (item == null) {
      return undefined;
    }

    return item;
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
