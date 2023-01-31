import type IBaseOption from '#configs/interfaces/IBaseOption';

export default interface ITruncateSchemaOption extends IBaseOption {
  discriminator: 'truncate-schema';
}
