import type { CE_OUTPUT_FORMAT } from '#configs/interfaces/CE_OUTPUT_FORMAT';
import type IBaseOption from '#configs/interfaces/IBaseOption';
import type * as tjsg from 'ts-json-schema-generator';

interface IRefreshSchemaOption {
  discriminator: 'refresh-schema';

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

type TRefreshSchemaOption = IRefreshSchemaOption & IBaseOption;

export default TRefreshSchemaOption;
