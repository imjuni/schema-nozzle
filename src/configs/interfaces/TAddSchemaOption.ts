import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import type { IGenerateOption } from '#/configs/interfaces/IGenerateOption';
import type { IResolvedPaths } from '#/configs/interfaces/IResolvedPaths';

export interface IAddSchemaOption {
  $kind: 'add-schema';

  /** use checkbox with multiple selections */
  multiple: boolean;

  files: string[];

  types: string[];
}

export type TAddSchemaBaseOption = IAddSchemaOption & IGenerateOption & IBaseOption;

export type TAddSchemaOption = TAddSchemaBaseOption & {
  cwd: string;
  projectDir: string;
} & {
  resolved: IResolvedPaths;
};
