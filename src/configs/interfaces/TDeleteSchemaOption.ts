import type { IBaseOption } from '#/configs/interfaces/IBaseOption';

export interface IDeleteSchemaOption extends IBaseOption {
  $kind: 'delete-schema';

  /** use checkbox with multiple selections */
  multiple: boolean;

  include: string[];

  exclude: string[];
}

export type TDeleteSchemaOption = IDeleteSchemaOption & IBaseOption;
