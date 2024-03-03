/* eslint-disable max-classes-per-file */
import { LokiDb } from '#/databases/files/LokiDb';
import Lokijs from 'lokijs';

let it: LokiDb;

let isBootstrap: boolean = false;

export function container(): Readonly<LokiDb> {
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
        } else {
          resolve(lokidb);
        }
      },
    });
  });

  it = new LokiDb(db);
  isBootstrap = true;
}
