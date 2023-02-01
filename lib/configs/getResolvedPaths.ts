import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';
import type TAddSchemaOption from '#configs/interfaces/TAddSchemaOption';
import type TDeleteSchemaOption from '#configs/interfaces/TDeleteSchemaOption';
import type TRefreshSchemaOption from '#configs/interfaces/TRefreshSchemaOption';
import type TTruncateSchemaOption from '#configs/interfaces/TTruncateSchemaOption';
import { replaceSepToPosix, win32DriveLetterUpdown } from 'my-node-fp';
import path from 'path';

export default function getResolvedPaths<
  T extends TDeleteSchemaOption | TAddSchemaOption | TTruncateSchemaOption | TRefreshSchemaOption,
>(option: T): IResolvedPaths {
  const project = replaceSepToPosix(win32DriveLetterUpdown(path.resolve(option.project), 'upper'));
  const cwd = replaceSepToPosix(path.resolve(win32DriveLetterUpdown(process.cwd(), 'upper')));
  const output = replaceSepToPosix(path.resolve(win32DriveLetterUpdown(option.output, 'upper')));

  return { project, cwd, output };
}
