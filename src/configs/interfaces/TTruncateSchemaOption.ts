import type { IBaseOption } from '#/configs/interfaces/IBaseOption';

export interface ITruncateSchemaOption {
  $kind: 'truncate-schema';
}

export type TTruncateSchemaOption = ITruncateSchemaOption & IBaseOption;
