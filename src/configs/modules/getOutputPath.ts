import { getDirnameSync } from 'my-node-fp';
import pathe from 'pathe';

export function getOutputPath(cwd: string, project: string, output?: string) {
  if (output != null) {
    const result = pathe.isAbsolute(output)
      ? pathe.resolve(output)
      : pathe.resolve(pathe.join(cwd, output));

    return result;
  }

  return getDirnameSync(project);
}
