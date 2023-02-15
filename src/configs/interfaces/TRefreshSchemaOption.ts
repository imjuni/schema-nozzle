import type { CE_OUTPUT_FORMAT } from '#configs/interfaces/CE_OUTPUT_FORMAT';
import type IBaseOption from '#configs/interfaces/IBaseOption';
import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';
import type * as tjsg from 'ts-json-schema-generator';

interface IRefreshSchemaOption {
  discriminator: 'refresh-schema';

  /** ts-json-schema-generator option file path */
  generatorOption?: string | tjsg.Config;

  /**
   * json-schema save format
   *
   * * json: json object
   * * string: plain string
   * * base64: plain string > base64
   * */
  format: CE_OUTPUT_FORMAT;

  /** target list filename */
  listFile?: string;
}

export type TRefreshSchemaBaseOption = IRefreshSchemaOption & IBaseOption;

type TRefreshSchemaOption = IRefreshSchemaOption &
  IBaseOption &
  IResolvedPaths & { generatorOptionObject: tjsg.Config; files: string[] };

export default TRefreshSchemaOption;
