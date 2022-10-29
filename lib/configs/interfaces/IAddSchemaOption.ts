import IBaseOption from '@configs/interfaces/IBaseOption';
import * as tjsg from 'ts-json-schema-generator';

export default interface IAddSchemaOption extends IBaseOption {
  discriminator: 'add-schema';

  /** input filename */
  files: string[];

  /** use checkbox with multiple selections */
  multiple: boolean;

  /** ts-json-schema-generator option file path */
  generatorOption: string | tjsg.Config;
}
