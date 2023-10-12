import type IResolvedPaths from '#/configs/interfaces/IResolvedPaths';
import type TAddSchemaOption from '#/configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from '#/configs/interfaces/TRefreshSchemaOption';
import getCwd from '#/tools/getCwd';
import { getDirnameSync } from 'my-node-fp';
import path from 'path';
import type { SetOptional } from 'type-fest';

export default function getResolvedPaths(
  option: SetOptional<
    Pick<TAddSchemaOption | TRefreshSchemaOption, 'project' | 'output' | 'rootDir'>,
    'output'
  >,
): IResolvedPaths {
  const cwd = getCwd(process.env);
  const project = path.isAbsolute(option.project)
    ? path.resolve(option.project)
    : path.resolve(path.join(cwd, option.project));

  const getOutputPathHandler = () => {
    if (option.output != null) {
      const output = path.isAbsolute(option.output)
        ? path.resolve(option.output)
        : path.resolve(path.join(cwd, option.output));

      return output;
    }

    return getDirnameSync(project);
  };

  const getRootDirHandler = () => {
    if (option.rootDir != null) {
      const rootDir = path.isAbsolute(option.rootDir)
        ? path.resolve(option.rootDir)
        : path.resolve(path.join(cwd, option.rootDir));

      return rootDir;
    }

    return undefined;
  };

  return { project, cwd, output: getOutputPathHandler(), rootDir: getRootDirHandler() };
}
