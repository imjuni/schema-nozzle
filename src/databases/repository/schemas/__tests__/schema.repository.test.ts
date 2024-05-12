import { CE_ALASQL_TABLE_NAME } from '#/databases/const-enum/CE_ALASQL_TABLE_NAME';
import { makeDatabase } from '#/databases/files/makeDatabase';
import { makeRepository } from '#/databases/repository/makeRepository';
import type { SchemaRepository } from '#/databases/repository/schemas/SchemaRepository';
import { container } from '#/modules/containers/container';
import { REPOSITORY_SCHEMAS_SYMBOL_KEY } from '#/modules/containers/keys';
import alasql from 'alasql';
import pathe from 'pathe';
import { beforeAll, describe, expect, it } from 'vitest';

beforeAll(async () => {
  await makeDatabase(pathe.join($context.tsconfigDirPath, 'db-for-test.json'));
  makeRepository();
});

describe('SchemaRepository', () => {
  it('types', async () => {
    const schemasRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
    const types = await schemasRepo.types();
    expect(types).toMatchObject([
      { id: 'a', filePath: undefined },
      { id: 'b', filePath: '/a/b/c' },
      { id: 'c', filePath: undefined },
      { id: 'd', filePath: undefined },
      { id: 'e', filePath: undefined },
      { id: 'f', filePath: undefined },
    ]);
  });

  it('select', async () => {
    const schemasRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
    const r01 = await schemasRepo.select('a');
    expect(r01).toMatchObject({ id: 'a', schema: { id: 'a' }, typeName: 'tA' });
  });

  it('select schemas, but cannot found record', async () => {
    const schemasRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
    const r01 = await schemasRepo.select('z');
    expect(r01).toBeUndefined();
  });

  it('selects', async () => {
    const schemasRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
    const r01 = await schemasRepo.selects(['a', 'b']);

    expect(r01).toMatchObject([
      { id: 'a', schema: { id: 'a' }, typeName: 'tA' },
      { id: 'b', schema: { id: 'b' }, typeName: 'tB' },
    ]);
  });

  it('deletes', async () => {
    const schemasRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
    const prevLen = alasql.tables[CE_ALASQL_TABLE_NAME.SCHEMA]?.data.length ?? 0;
    await schemasRepo.deletes(['a', 'b']);
    expect(alasql.tables[CE_ALASQL_TABLE_NAME.SCHEMA]?.data.length).toEqual(prevLen - 2);
  });

  it('insert', async () => {
    const schemasRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
    const inserted = await schemasRepo.insert({
      id: 'x',
      schema: { id: 'x' },
      typeName: 'tXX',
    });

    expect(inserted).toMatchObject({
      id: 'x',
      schema: { id: 'x' },
      typeName: 'tXX',
    });
  });

  it('upsert, inserted', async () => {
    const schemasRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
    await schemasRepo.upsert({
      id: 'd',
      schema: { id: 'd', name: 'my-name-d-d-d-d' },
      typeName: 'tDD-!-D',
    });
    const inserted = await schemasRepo.upsert({
      id: 'y',
      schema: { id: 'y', name: 'my-name-y' },
      typeName: 'tYY',
    });

    expect(inserted).toMatchObject({
      id: 'y',
      schema: { id: 'y', name: 'my-name-y' },
      typeName: 'tYY',
    });
  });

  it('upsert, updated', async () => {
    const schemasRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
    const inserted = await schemasRepo.upsert({
      id: 'd',
      schema: { id: 'd', name: 'my-name-d' },
      typeName: 'tDD',
      filePath: 'my-path-d',
    });
    expect(alasql.tables[CE_ALASQL_TABLE_NAME.SCHEMA]?.data.length).toEqual(6);
    expect(inserted).toMatchObject({
      id: 'd',
      schema: { id: 'd', name: 'my-name-d' },
      typeName: 'tDD',
      filePath: 'my-path-d',
    });
  });

  it('tables, full-scan', async () => {
    const schemasRepo = container.resolve<SchemaRepository>(REPOSITORY_SCHEMAS_SYMBOL_KEY);
    const tables = await schemasRepo.tables();
    expect(tables.length).toEqual(alasql.tables[CE_ALASQL_TABLE_NAME.SCHEMA]?.data.length);
  });
});
