import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import type { IResolvedPaths } from '#/configs/interfaces/IResolvedPaths';
import type { Config } from 'ts-json-schema-generator';

export interface IAddSchemaOption {
  $kind: 'add-schema';

  /** input filename */
  files: string[];

  /** use checkbox with multiple selections */
  multiple: boolean;

  useDefinitions: boolean;

  /** specify the root folder within your schema path */
  rootDirs?: string[];

  /**
   * enter a prefix to add when writing a name or path in the `$id` field
   * eg. component-name > #/components/schemas/component-name
   * */
  schemaPathPrefix?: string;

  /** list of files to generate json-schema from */
  include: string[];

  /** list of files to exclude from the list of files to generate json-schema from */
  exclude: string[];

  /** ts-json-schema-generator option file path */
  generatorOption?: string | Config;
}

export type TAddSchemaBaseOption = IAddSchemaOption & IBaseOption;

export type TAddSchemaOption = IAddSchemaOption &
  IBaseOption &
  IResolvedPaths & { generatorOptionObject: Config };
