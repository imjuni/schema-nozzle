import type { ISchemaRecord } from '#/databases/interfaces/ISchemaRecord';
import type { ISchemaRefRecord } from '#/databases/interfaces/ISchemaRefRecord';
import type { CreateJSONSchemaError } from '#/errors/CreateJsonSchemaError';

export class GeneratedContainer {
  #records: ISchemaRecord[];

  #refs: ISchemaRefRecord[];

  #errors: CreateJSONSchemaError[];

  get records(): Readonly<ISchemaRecord[]> {
    return this.#records;
  }

  get refs(): Readonly<ISchemaRefRecord[]> {
    return this.#refs;
  }

  get errors(): Readonly<CreateJSONSchemaError>[] {
    return this.#errors;
  }

  constructor() {
    this.#records = [];
    this.#refs = [];
    this.#errors = [];
  }

  addRecord(...record: ISchemaRecord[]) {
    this.#records.push(...record);
  }

  addRefs(...refs: ISchemaRefRecord[]) {
    this.#refs.push(...refs);
  }

  addErrors(...errors: CreateJSONSchemaError[]) {
    this.#errors.push(...errors);
  }
}
