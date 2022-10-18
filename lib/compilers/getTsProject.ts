import { isError } from 'my-easy-fp';
import { exists } from 'my-node-fp';
import { fail, pass, PassFailEither } from 'my-only-either';
import * as tsm from 'ts-morph';

export default async function getTsProject(
  projectPath: string,
): Promise<PassFailEither<Error, tsm.Project>> {
  try {
    if ((await exists(projectPath)) === false) {
      return fail(new Error(`Could not found project path: ${projectPath}`));
    }

    // Exclude exclude file in .ctiignore file: more exclude progress
    const project = new tsm.Project({ tsConfigFilePath: projectPath });

    return pass(project);
  } catch (catched) {
    const err = isError(catched) ?? new Error('raised unknown error get typescript project');
    return fail(err);
  }
}
