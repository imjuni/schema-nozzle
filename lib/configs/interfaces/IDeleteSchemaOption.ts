import IBaseOption from '@configs/interfaces/IBaseOption';

export default interface IDeleteSchemaOption extends IBaseOption {
  discriminator: 'delete-schema';
}
