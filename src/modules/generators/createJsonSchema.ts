import { CreateJSONSchemaError } from '#/errors/CreateJsonSchemaError';
import { container } from '#/modules/containers/container';
import { SCHEMA_GENERATOR_SYMBOL_KEY } from '#/modules/containers/keys';
import type { AnySchemaObject } from 'ajv';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';
import type { createGenerator } from 'ts-json-schema-generator';

export function createJsonSchema(
  filePath: string,
  exportedType: string,
): PassFailEither<
  CreateJSONSchemaError,
  { filePath: string; exportedType: string; schema: AnySchemaObject }
> {
  try {
    const generator = container.resolve<ReturnType<typeof createGenerator>>(
      SCHEMA_GENERATOR_SYMBOL_KEY,
    );
    const schema: AnySchemaObject = generator.createSchema(exportedType);
    return pass({ filePath, exportedType, schema });
  } catch (caught) {
    const err = isError(caught, new Error('unknown error raised'));
    return fail(new CreateJSONSchemaError(filePath, exportedType, err.message));
  }
}
