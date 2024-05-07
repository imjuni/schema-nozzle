import type { IResolvedPaths } from '#/configs/interfaces/IResolvedPaths';
import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import { getCwd } from '#/tools/getCwd';
import { getDirnameSync } from 'my-node-fp';
import pathe from 'pathe';

export function getResolvedPaths(
  options: Pick<TAddSchemaOption | TRefreshSchemaOption, 'project' | 'output' | 'rootDirs'>,
): IResolvedPaths {
  const cwd = getCwd(process.env);
  const project = pathe.isAbsolute(options.project)
    ? pathe.resolve(options.project)
    : pathe.resolve(pathe.join(cwd, options.project));
  const projectDir = getDirnameSync(project);
  const output = pathe.isAbsolute(options.output)
    ? pathe.resolve(options.output)
    : pathe.resolve(pathe.join(cwd, options.output));
  const rootDirs = options.rootDirs.map((rootDir) =>
    pathe.isAbsolute(rootDir) ? rootDir : pathe.resolve(rootDir),
  );

  return {
    project,
    projectDir,
    cwd,
    output,
    rootDirs,
  };
}
