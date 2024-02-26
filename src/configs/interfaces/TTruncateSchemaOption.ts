import type { IBaseOption } from '#/configs/interfaces/IBaseOption';

export interface ITruncateSchemaOption {
  discriminator: 'truncate-schema';
}

export type TTruncateSchemaOption = ITruncateSchemaOption & IBaseOption;
