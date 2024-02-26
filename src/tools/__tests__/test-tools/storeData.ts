import fastSafeStringify from 'fast-safe-stringify';
import fs from 'fs';

export async function storeData<T = unknown>(data: T, filePath?: string) {
  await fs.promises.writeFile(
    filePath ?? 'testcase-data.json',
    fastSafeStringify(data, undefined, 2),
  );
}
