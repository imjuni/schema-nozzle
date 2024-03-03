import { createGenerator, type Config, type SchemaGenerator } from 'ts-json-schema-generator';

export class NozzleGenerator {
  #generator: SchemaGenerator;

  constructor(options: Config) {
    this.#generator = createGenerator(options);
  }

  get generator(): SchemaGenerator {
    return this.#generator;
  }
}
