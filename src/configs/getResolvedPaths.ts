import type IBaseOption from '#configs/interfaces/IBaseOption';
import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';
import getCwd from '#tools/getCwd';
import { replaceSepToPosix, win32DriveLetterUpdown } from 'my-node-fp';
import path from 'path';

export default function getResolvedPaths(
  option: Pick<IBaseOption, 'project' | 'output'>,
): IResolvedPaths {
  const project = replaceSepToPosix(win32DriveLetterUpdown(path.resolve(option.project), 'upper'));
  const cwd = replaceSepToPosix(path.resolve(win32DriveLetterUpdown(getCwd(process.env), 'upper')));
  const output = replaceSepToPosix(path.resolve(win32DriveLetterUpdown(option.output, 'upper')));

  return { project, cwd, output };
}
