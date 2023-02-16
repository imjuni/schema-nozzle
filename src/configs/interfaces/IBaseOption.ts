export default interface IBaseOption {
  /** configuration file */
  config?: string;

  /** tsconfig.json file path */
  project: string;

  /** type name in input filename */
  types: string[];

  /** database file directory */
  output: string;

  /** skip compile error */
  skipError: boolean;

  /** ts-json-schema-generator timeout: default 90 seconds */
  generatorTimeout: number;
}
