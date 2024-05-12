import type { Config } from 'ts-json-schema-generator';
import type { SetRequired } from 'type-fest';

export interface IGenerateOption {
  /** list of files to generate json-schema from */
  include: string[];

  /** list of files to exclude from the list of files to generate json-schema from */
  exclude: string[];

  /** specify the root folder within your schema path */
  rootDirs: string[];

  jsVar: boolean;

  /** skip compile error */
  skipError: boolean;

  /** include path in schema id */
  useSchemaPath: boolean;

  /**
   * URL escaping character
   */
  escapeChar: string;

  /** server url */
  serverUrl: string;

  /** ts-json-schema-generator option file path */
  generatorOption: SetRequired<Config, 'encodeRefs'>;
}
