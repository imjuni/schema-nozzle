import IBaseOption from '@configs/interfaces/IBaseOption';

export default interface IAddSchemaOption extends IBaseOption {
  type: 'add-schema';

  /** input filename */
  files: string[];
}
