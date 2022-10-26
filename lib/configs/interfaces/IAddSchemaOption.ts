import IBaseOption from '@configs/interfaces/IBaseOption';

export default interface IAddSchemaOption extends IBaseOption {
  discriminator: 'add-schema';

  /** input filename */
  files: string[];

  /** use checkbox with multiple selections */
  multiple: boolean;
}
