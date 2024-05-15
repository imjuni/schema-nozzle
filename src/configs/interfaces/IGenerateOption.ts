import type { Config } from 'ts-json-schema-generator';
import type { SetRequired } from 'type-fest';

export interface IGenerateOption {
  /** list of files to generate json-schema from */
  include: string[];

  /** list of files to exclude from the list of files to generate json-schema from */
  exclude: string[];

  /** specify the root folder within your schema path */
  rootDirs: string[];

  /**
   * include the schema path in the schema id to convert the path and schema name to
   * js variables for use in places like OpenAPI v2 that can't handle paths when the
   * schema is created, such as
   */
  jsVar: boolean;

  /** skip compile error */
  skipError: boolean;

  /** include schema file path in schema id */
  useSchemaPath: boolean;

  /**
   * Characters that cannot be used as variable names when converting JS variables Characters to use when converting
   */
  escapeChar: string;

  /** enter the server url that will be used as the `$id` in the schema store when the topRef setting is set to true */
  serverUrl: string;

  /** ts-json-schema-generator option file path */
  generatorOption: SetRequired<Config, 'encodeRefs'>;
}
