import IConsoleOption from '@configs/interfaces/IConsoleOption';
import IDatabaseOption from '@configs/interfaces/IDatabaseOption';
import IResolvedPaths from '@configs/interfaces/IResolvedPaths';
import { replaceSepToPosix, win32DriveLetterUpdown } from 'my-node-fp';
import path from 'path';

export default function getResolvedPaths<T extends IConsoleOption | IDatabaseOption>(
  option: T,
): IResolvedPaths {
  const project = replaceSepToPosix(win32DriveLetterUpdown(path.resolve(option.project), 'upper'));
  const cwd = replaceSepToPosix(path.resolve(win32DriveLetterUpdown(process.cwd(), 'upper')));

  return { project, cwd };
}
