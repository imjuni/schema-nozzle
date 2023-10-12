import type TAddSchemaOption from '#/configs/interfaces/TAddSchemaOption';
import type TRefreshSchemaOption from '#/configs/interfaces/TRefreshSchemaOption';
import type TWatchSchemaOption from '#/configs/interfaces/TWatchSchemaOption';
import type { Config, SchemaGenerator } from 'ts-json-schema-generator';
import type { Project } from 'ts-morph';

export default class NozzleContext {
  #project: Project | undefined;

  #option: TAddSchemaOption | TRefreshSchemaOption | TWatchSchemaOption | undefined;

  #generatorOption: Config | undefined;

  #generator: SchemaGenerator | undefined;

  get project(): Project {
    if (this.#project == null) throw new Error('Empty project in nozzle-context');
    return this.#project;
  }

  set project(value) {
    this.#project = value;
  }

  get option(): TAddSchemaOption | TRefreshSchemaOption | TWatchSchemaOption {
    if (this.#option == null) throw new Error('Empty option in nozzle-context');

    if (this.#option.discriminator === 'add-schema') {
      return this.#option;
    }

    if (this.#option.discriminator === 'refresh-schema') {
      return this.#option;
    }

    return this.#option;
  }

  set option(value) {
    this.#option = value;
  }

  get generatorOption(): Config {
    if (this.#generatorOption == null) throw new Error('Empty generatorOption in nozzle-context');
    return this.#generatorOption;
  }

  set generatorOption(value) {
    this.#generatorOption = value;
  }

  get generator(): SchemaGenerator {
    if (this.#generator == null) throw new Error('Empty generator in nozzle-context');
    return this.#generator;
  }

  set generator(value) {
    this.#generator = value;
  }

  updateFiles(files: string[]) {
    if (this.#option == null) throw new Error('Empty option in nozzle-context');
    this.#option.files = files;
  }

  updateTypes(types: string[]) {
    if (this.#option == null) throw new Error('Empty option in nozzle-context');
    this.#option.types = types;
  }
}
