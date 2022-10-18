export default interface IBaseOption {
  /** configuration file */
  config: string;

  /** tsconfig.json file path */
  project: string;

  /** input filename */
  files: string[];

  /** type name in input filename */
  types: string[];

  /** no banner in generated schema */
  noBanner: boolean;

  skipError: boolean;

  prefix?: string;
  postfix?: string;

  /** verbose message */
  verbose: boolean;
}
