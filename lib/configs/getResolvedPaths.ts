import type IDeleteSchemaOption from '@configs/interfaces/IDeleteSchemaOption';
import type IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import type IResolvedPaths from '@configs/interfaces/IResolvedPaths';
import type ITruncateSchemaOption from '@configs/interfaces/ITruncateSchemaOption';
import type TAddSchemaOption from '@configs/interfaces/TAddSchemaOption';
import { replaceSepToPosix, win32DriveLetterUpdown } from 'my-node-fp';
import path from 'path';

export default function getResolvedPaths<
  T extends IDeleteSchemaOption | TAddSchemaOption | ITruncateSchemaOption | IRefreshSchemaOption,
>(option: T): IResolvedPaths {
  const project = replaceSepToPosix(win32DriveLetterUpdown(path.resolve(option.project), 'upper'));
  const cwd = replaceSepToPosix(path.resolve(win32DriveLetterUpdown(process.cwd(), 'upper')));
  const output = replaceSepToPosix(path.resolve(win32DriveLetterUpdown(option.output, 'upper')));

  return { project, cwd, output };
}
