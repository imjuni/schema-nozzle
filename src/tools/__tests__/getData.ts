import fs from 'fs';
import { parse } from 'jsonc-parser';

export default async function getData<T = unknown>(filePath: string) {
  const data = parse((await fs.promises.readFile(filePath)).toString()) as T;
  return data;
}
