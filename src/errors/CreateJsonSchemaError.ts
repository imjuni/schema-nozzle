export class CreateJSONSchemaError extends Error {
  constructor(
    public readonly filePath: string,
    public readonly typeName: string,
    message: string,
  ) {
    super(message);
  }
}
