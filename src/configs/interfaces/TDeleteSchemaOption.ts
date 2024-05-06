import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import type { IGenerateOption } from '#/configs/interfaces/IGenerateOption';
import type { IResolvedPaths } from '#/configs/interfaces/IResolvedPaths';

export interface IDeleteSchemaOption {
  $kind: 'delete-schema';

  /** use checkbox with multiple selections */
  multiple: boolean;
}

export type TDeleteSchemaBaseOption = IDeleteSchemaOption & IGenerateOption & IBaseOption;

export type TDeleteSchemaOption = TDeleteSchemaBaseOption & {
  cwd: string;
  projectDir: string;
} & { resolved: IResolvedPaths };
