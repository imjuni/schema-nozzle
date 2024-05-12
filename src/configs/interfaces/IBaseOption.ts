export interface IBaseOption {
  /** configuration file */
  config?: string;

  /** tsconfig.json file path */
  project: string;

  /** database file directory or filename */
  output: string;

  /** display cli logo */
  cliLogo: boolean;

  verbose: boolean;
}
