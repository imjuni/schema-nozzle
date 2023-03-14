import { existsSync } from 'my-node-fp';
import * as tsm from 'ts-morph';

export default async function getTsProject(
  option: Omit<tsm.ProjectOptions, 'tsConfigFilePath'> & { tsConfigFilePath: string },
): Promise<tsm.Project> {
  if (existsSync(option.tsConfigFilePath) === false) {
    throw new Error(`Could not found project path: ${option.tsConfigFilePath}`);
  }

  const project = new tsm.Project(option);
  return project;
}
