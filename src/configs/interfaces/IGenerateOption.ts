import type { Config } from 'ts-json-schema-generator';

export interface IGenerateOption {
  /** list of files to generate json-schema from */
  include: string[];

  /** list of files to exclude from the list of files to generate json-schema from */
  exclude: string[];

  /** specify the root folder within your schema path */
  rootDirs: string[];

  /** skip compile error */
  skipError: boolean;

  /** use topRef configuration in generatorOption */
  topRef: boolean;

  /** include path in schema id */
  useSchemaPath: boolean;

  /**
   * URL escaping character
   */
  escapeChar: string;

  /** server url */
  serverUrl: string;

  /** ts-json-schema-generator option file path */
  generatorOption: Config;
}
