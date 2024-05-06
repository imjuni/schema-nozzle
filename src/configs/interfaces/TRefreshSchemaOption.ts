import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import type { IGenerateOption } from '#/configs/interfaces/IGenerateOption';
import type { IResolvedPaths } from '#/configs/interfaces/IResolvedPaths';

interface IRefreshSchemaOption {
  $kind: 'refresh-schema';

  /** truncate previous database file */
  truncate?: boolean;
}

export type TRefreshSchemaBaseOption = IRefreshSchemaOption & IGenerateOption & IBaseOption;

export type TRefreshSchemaOption = TRefreshSchemaBaseOption & {
  cwd: string;
  projectDir: string;
} & {
  resolved: IResolvedPaths;
};
