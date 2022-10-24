export default interface IBaseOption {
  /** configuration file */
  config?: string;

  /** tsconfig.json file path */
  project: string;

  /** input filename */
  files: string[];

  /** type name in input filename */
  types: string[];

  /** no banner in generated schema */
  noBanner: boolean;

  /** database file directory */
  output: string;

  skipError: boolean;

  prefix?: string;
  postfix?: string;

  /** verbose message */
  verbose: boolean;
}
