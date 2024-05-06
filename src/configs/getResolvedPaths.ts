import type { IResolvedPaths } from '#/configs/interfaces/IResolvedPaths';
import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import { getCwd } from '#/tools/getCwd';
import { getDirnameSync } from 'my-node-fp';
import pathe from 'pathe';

export function getResolvedPaths(
  option: Pick<TAddSchemaOption | TRefreshSchemaOption, 'project' | 'output' | 'rootDirs'>,
): IResolvedPaths {
  const cwd = getCwd(process.env);
  const project = pathe.isAbsolute(option.project)
    ? pathe.resolve(option.project)
    : pathe.resolve(pathe.join(cwd, option.project));
  const projectDir = getDirnameSync(project);
  const output = pathe.isAbsolute(option.output)
    ? pathe.resolve(option.output)
    : pathe.resolve(pathe.join(cwd, option.output));
  const rootDirs = option.rootDirs.map((rootDir) =>
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
