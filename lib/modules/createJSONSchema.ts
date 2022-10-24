import { TEXPORTED_TYPE } from '@compilers/interfaces/TEXPORTED_TYPE';
import IBaseOption from '@configs/interfaces/IBaseOption';
import CreateJSONSchemaError from '@errors/CreateJsonSchemaError';
import ICreatedJSONSchema from '@modules/interfaces/ICreatedJSONSchema';
import { JSONSchema7 } from 'json-schema';
import { isError } from 'my-easy-fp';
import { fail, pass, PassFailEither } from 'my-only-either';
import * as TSJ from 'ts-json-schema-generator';
import * as tsm from 'ts-morph';

interface ICreateJSONSchemaArgs {
  option: IBaseOption;
  filePath: string;
  typeName: string;
  type: TEXPORTED_TYPE;
  schemaConfig?: TSJ.Config;
  imports: tsm.ImportDeclaration[];
}

export default function createJSONSchema({
  option,
  schemaConfig,
  filePath,
  type,
  imports,
  typeName,
}: ICreateJSONSchemaArgs): PassFailEither<
  Error,
  ICreatedJSONSchema & { imports: tsm.ImportDeclaration[] }
> {
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
      strictTuples: schemaConfig?.strictTuples ?? true,
      skipTypeCheck: schemaConfig?.skipTypeCheck ?? option.skipError,
      encodeRefs: schemaConfig?.encodeRefs ?? true,
      extraTags: schemaConfig?.extraTags,
      additionalProperties: schemaConfig?.additionalProperties ?? false,
    };

    const generator = TSJ.createGenerator(generatorOption);

    const schema: JSONSchema7 = generator.createSchema(typeName);

    return pass({
      filePath,
      typeName,
      schema,
      imports,
      type,
    });
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised');
    return fail(new CreateJSONSchemaError(filePath, typeName, err.message));
  }
}
