import CreateJSONSchemaError from '#errors/CreateJsonSchemaError';
import type { JSONSchema7 } from 'json-schema';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';
import * as tjsg from 'ts-json-schema-generator';

export default function createJSONSchema(
  filePath: string,
  exportedType: string,
  generatorOption: tjsg.Config,
): PassFailEither<Error, { filePath: string; exportedType: string; schema: JSONSchema7 }> {
  try {
    const option: tjsg.Config = {
      ...generatorOption,
      path: filePath,
      type: exportedType,
      schemaId:
        generatorOption.schemaId == null || generatorOption.schemaId === ''
          ? exportedType
          : generatorOption.schemaId,
    };

    const generator = tjsg.createGenerator(option);

    const schema: JSONSchema7 = generator.createSchema(exportedType);

    return pass({
      filePath,
      exportedType,
      schema,
    });
  } catch (caught) {
    const err = isError(caught, new Error('unknown error raised'));
    return fail(new CreateJSONSchemaError(filePath, exportedType, err.message));
  }
}
