import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import { CreateJSONSchemaError } from '#/errors/CreateJsonSchemaError';
import type { AnySchemaObject } from 'ajv';
import { isError } from 'my-easy-fp';
import { fail, pass, type PassFailEither } from 'my-only-either';
import { createGenerator, type Config, type SchemaGenerator } from 'ts-json-schema-generator';

export class GeneratorContainer {
  static #it: GeneratorContainer;

  static #isBootstrap: boolean;

  public static get it(): Readonly<GeneratorContainer> {
    return GeneratorContainer.#it;
  }

  static bootstrap(
    options:
      | Pick<TAddSchemaOption, 'project' | 'generatorOptionObject'>
      | Pick<TRefreshSchemaOption, 'project' | 'generatorOptionObject'>,
  ) {
    if (GeneratorContainer.#isBootstrap) {
      return;
    }

    GeneratorContainer.#it = new GeneratorContainer({
      ...(options.generatorOptionObject ?? {}),
      tsconfig: options.project,
    });
  }

  #generator: SchemaGenerator;

  constructor(options: Config) {
    this.#generator = createGenerator(options);
  }

  get generator(): SchemaGenerator {
    return this.#generator;
  }

  create(
    filePath: string,
    exportedType: string,
  ): PassFailEither<Error, { filePath: string; exportedType: string; schema: AnySchemaObject }> {
    try {
      const schema: AnySchemaObject = this.#generator.createSchema(exportedType);

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
}
