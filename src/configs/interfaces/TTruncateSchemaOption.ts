import type IBaseOption from '#configs/interfaces/IBaseOption';

export interface ITruncateSchemaOption {
  discriminator: 'truncate-schema';
}

type TTruncateSchemaOption = ITruncateSchemaOption & IBaseOption;

export default TTruncateSchemaOption;
