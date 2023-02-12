import type { CE_OUTPUT_FORMAT } from '#configs/interfaces/CE_OUTPUT_FORMAT';
import type IBaseOption from '#configs/interfaces/IBaseOption';
import type * as tjsg from 'ts-json-schema-generator';

export interface IAddSchemaOption {
  discriminator: 'add-schema';

  /** input filename */
  files: string[];

  /** use checkbox with multiple selections */
  multiple: boolean;

  /** ts-json-schema-generator option file path */
  generatorOption?: string | tjsg.Config;

  /**
   * json-schema save format
   * * json: json object
   * * string: plain string
   * * base64: plain string > base64
   * */
  format: CE_OUTPUT_FORMAT;
}

type TAddSchemaOption = IAddSchemaOption & IBaseOption;

export default TAddSchemaOption;
