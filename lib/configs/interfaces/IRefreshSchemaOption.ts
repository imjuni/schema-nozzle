import IBaseOption from '@configs/interfaces/IBaseOption';
import * as tjsg from 'ts-json-schema-generator';

export default interface IRefreshSchemaOption extends IBaseOption {
  discriminator: 'refresh-schema';

  /** ts-json-schema-generator option file path */
  generatorOption: string | tjsg.Config;
}
