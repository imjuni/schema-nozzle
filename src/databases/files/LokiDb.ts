import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import type { IDatabaseItem } from '#/modules/interfaces/IDatabaseItem';
import type Lokijs from 'lokijs';

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

  get loki(): Readonly<Lokijs> {
    return this.#loki;
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

  delete() {
    return new Promise<void>((resolve, reject) => {
      this.#loki.deleteDatabase((err) => {
        if (err != null) {
          return reject(err);
        }

        return resolve();
      });
    });
  }
}
