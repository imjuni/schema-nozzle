export interface ISchemaRefRecord {
  /** sha256 hash. hash generated from filePath with typeName */
  id: string;

  /** referenced schema id */
  refId: string;
}
