import type IBaseOption from '@configs/interfaces/IBaseOption';
import type { TOUTPUT_FORMAT } from '@configs/interfaces/TOUTPUT_FORMAT';
import type * as tjsg from 'ts-json-schema-generator';

export default interface IRefreshSchemaOption extends IBaseOption {
  discriminator: 'refresh-schema';

  /** ts-json-schema-generator option file path */
  generatorOption: string | tjsg.Config;

  /**
   * json-schema save format
   * * json: json object
   * * string: plain string
   * * base64: plain string > base64
   * */
  format: TOUTPUT_FORMAT;
}
