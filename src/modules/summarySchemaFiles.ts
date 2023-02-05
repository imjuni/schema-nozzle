import { CE_DEFAULT_VALUE } from '#configs/interfaces/CE_DEFAULT_VALUE';
import type IBaseOption from '#configs/interfaces/IBaseOption';
import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';
import getCwd from '#tools/getCwd';
import fs from 'fs';
import ignore from 'ignore';
import { exists, startSepRemove } from 'my-node-fp';
import path from 'path';
import type * as tsm from 'ts-morph';
import type { SetOptional } from 'type-fest';

export async function getSchemaListFilePath(filename?: string) {
  if (filename != null && (await exists(path.resolve(filename)))) {
    return path.resolve(filename);
  }

  const defaultValue = path.resolve(path.join(getCwd(process.env), CE_DEFAULT_VALUE.LIST_FILE));
  if (await exists(defaultValue)) {
    return defaultValue;
  }

  return undefined;
}

export async function getSchemaFileContent(filePath: string) {
  return (await fs.promises.readFile(filePath))
    .toString()
    .split('\n')
    .map((line) => line.trim());
}

export function addProjectFile(cwd: string, project?: tsm.Project): string[] {
  if (project == null) {
    return [];
  }

  const filePaths = project
    .getSourceFiles()
    .map((sourceFile) => sourceFile.getFilePath().replace(cwd, ''));

  return filePaths.map((filePath) => startSepRemove(filePath));
}

export default async function summarySchemaFiles({
  option,
  resolvedPaths,
  project,
}: {
  option?: SetOptional<Pick<IBaseOption, 'listFile'>, 'listFile'>;
  resolvedPaths: IResolvedPaths;
  project?: tsm.Project;
}) {
  const ig = ignore();

  if (option == null) {
    ig.add(addProjectFile(resolvedPaths.cwd, project));
    return ig;
  }

  const filePath = await getSchemaListFilePath(option.listFile);

  if (filePath == null) {
    ig.add(addProjectFile(resolvedPaths.cwd, project));
    return ig;
  }

  const lines = await getSchemaFileContent(filePath);
  ig.add(lines);

  return ig;
}
