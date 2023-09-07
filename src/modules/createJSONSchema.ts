import type { JSONSchema7 } from 'json-schema';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';
import CreateJSONSchemaError from 'src/errors/CreateJsonSchemaError';
import type { Config, SchemaGenerator } from 'ts-json-schema-generator';
import { createGenerator } from 'ts-json-schema-generator';

type TCreateJSONSchemaArgs =
  | {
      filePath: string;
      exportedType: string;
      option: Config;
    }
  | {
      filePath: string;
      exportedType: string;
      generator: SchemaGenerator;
    };

function getGenerator(args: TCreateJSONSchemaArgs) {
  if ('option' in args) {
    const option: Config = {
      ...args.option,
      path: args.filePath,
      type: args.exportedType,
    };

    return createGenerator(option);
  }

  return args.generator;
}

export default function createJSONSchema(
  args: TCreateJSONSchemaArgs,
): PassFailEither<Error, { filePath: string; exportedType: string; schema: JSONSchema7 }> {
  try {
    const generator = getGenerator(args);

    const schema: JSONSchema7 = generator.createSchema(args.exportedType);

    return pass({
      filePath: args.filePath,
      exportedType: args.exportedType,
      schema,
    });
  } catch (caught) {
    const err = isError(caught, new Error('unknown error raised'));
    return fail(new CreateJSONSchemaError(args.filePath, args.exportedType, err.message));
  }
}
