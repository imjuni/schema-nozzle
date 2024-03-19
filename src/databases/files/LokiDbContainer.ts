import { LokiDb } from '#/databases/files/LokiDb';
import Lokijs from 'lokijs';
import { existsSync } from 'my-node-fp';
import fs from 'node:fs';

let it: LokiDb;

let isBootstrap: boolean = false;

export function getIt(): Readonly<LokiDb> {
  return it;
}

export function bootstrap(options: { filename: string }) {
  if (isBootstrap) {
    return;
  }

  const lokidb = new Lokijs(options.filename, {
    env: 'NODEJS',
    adapter: {
      mode: 'fs',
      loadDatabase(dbname: string, callback: (value: unknown) => void) {
        if (existsSync(dbname)) {
          const buf = fs.readFileSync(dbname);
          callback(JSON.parse(buf.toString()));
        } else {
          callback({});
        }
      },
      saveDatabase(dbname, dbstring, callback) {
        fs.writeFileSync(dbname, dbstring as string);
        callback();
      },
      deleteDatabase(dbname, callback) {
        const filePath =
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          typeof dbname === 'object' ? (dbname.filename as string) : (dbname as string);

        if (existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        callback();
      },
    },
    throttledSaves: false,
    autoload: true,
    persistenceMethod: 'fs',
    serializationMethod: 'pretty',
  });

  lokidb.loadDatabase();

  it = new LokiDb(lokidb);
  isBootstrap = true;
}
