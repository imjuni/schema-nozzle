import type IBaseOption from '@configs/interfaces/IBaseOption';
import type { TOUTPUT_FORMAT } from '@configs/interfaces/TOUTPUT_FORMAT';
import type * as tjsg from 'ts-json-schema-generator';

export interface IAddSchemaOption {
  discriminator: 'add-schema';

  /** input filename */
  files: string[];

  /** use checkbox with multiple selections */
  multiple: boolean;

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

type TAddSchemaOption = IAddSchemaOption & IBaseOption;

export default TAddSchemaOption;
