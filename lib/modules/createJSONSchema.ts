import { TEXPORTED_TYPE } from '@compilers/interfaces/TEXPORTED_TYPE';
import IBaseOption from '@configs/interfaces/IBaseOption';
import CreateJSONSchemaError from '@errors/CreateJsonSchemaError';
import getBanner from '@modules/getBanner';
import ICreatedJSONSchema from '@modules/interfaces/ICreatedJSONSchema';
import { JSONSchema7 } from 'json-schema';
import { isError } from 'my-easy-fp';
import { fail, pass, PassFailEither } from 'my-only-either';
import * as TSJ from 'ts-json-schema-generator';

interface ICreateJSONSchema {
  option: IBaseOption;
  filePath: string;
  typeName: string;
  type: TEXPORTED_TYPE;
  schemaConfig?: TSJ.Config;
}

export default function createJSONSchema({
  option,
  schemaConfig,
  filePath,
  type,
  typeName,
}: ICreateJSONSchema): PassFailEither<Error, ICreatedJSONSchema> {
  try {
    const generatorOption: TSJ.Config = {
      path: filePath,
      type: typeName,
      tsconfig: option.project,
      minify: schemaConfig?.minify ?? false,
      schemaId: schemaConfig?.schemaId,
      expose: schemaConfig?.expose ?? 'export',
      topRef: schemaConfig?.topRef ?? false,
      jsDoc: schemaConfig?.jsDoc ?? 'extended',
      sortProps: schemaConfig?.sortProps ?? true,
      strictTuples: schemaConfig?.strictTuples,
      skipTypeCheck: schemaConfig?.skipTypeCheck ?? option.skipError,
      encodeRefs: schemaConfig?.encodeRefs,
      extraTags: schemaConfig?.extraTags,
      additionalProperties: schemaConfig?.additionalProperties ?? false,
    };

    const generator = TSJ.createGenerator(generatorOption);

    const schema: JSONSchema7 = generator.createSchema(typeName);

    return pass({
      filePath,
      typeName,
      schema,
      type,
      banner: getBanner(option),
    });
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised');
    return fail(new CreateJSONSchemaError(filePath, typeName, err.message));
  }
}
