import { CreateJSONSchemaError } from '#/errors/CreateJsonSchemaError';
import { getGenerator as generator } from '#/modules/generator/NozzleGeneratorContainer';
import type { AnySchemaObject } from 'ajv';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';

export function createJsonSchema(
  filePath: string,
  exportedType: string,
): PassFailEither<Error, { filePath: string; exportedType: string; schema: AnySchemaObject }> {
  try {
    const container = generator();
    const schema: AnySchemaObject = container.generator.createSchema(exportedType);
    return pass({ filePath, exportedType, schema });
  } catch (caught) {
    const err = isError(caught, new Error('unknown error raised'));
    return fail(new CreateJSONSchemaError(filePath, exportedType, err.message));
  }
}
