export interface IBaseOption {
  /** configuration file */
  config?: string;

  /** tsconfig.json file path */
  project: string;

  /** type name in input filename */
  types: string[];

  /** database file directory or filename */
  output: string;

  /** skip compile error */
  skipError: boolean;

  /** display cli logo */
  cliLogo: boolean;
}
