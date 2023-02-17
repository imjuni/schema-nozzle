import fs from 'fs';

export default async function getSchemaFileContent(filePath: string) {
  return (await fs.promises.readFile(filePath))
    .toString()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
}
