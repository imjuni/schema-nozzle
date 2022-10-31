import { isError } from 'my-easy-fp';
import { exists } from 'my-node-fp';
import { fail, pass, PassFailEither } from 'my-only-either';
import * as tsm from 'ts-morph';

export default async function getTsProject(
  option: Omit<tsm.ProjectOptions, 'tsConfigFilePath'> & { tsConfigFilePath: string },
): Promise<PassFailEither<Error, tsm.Project>> {
  try {
    if ((await exists(option.tsConfigFilePath)) === false) {
      return fail(new Error(`Could not found project path: ${option.tsConfigFilePath}`));
    }

    const project = new tsm.Project(option);

    return pass(project);
  } catch (catched) {
    const err = isError(catched) ?? new Error('raised unknown error get typescript project');
    return fail(err);
  }
}
