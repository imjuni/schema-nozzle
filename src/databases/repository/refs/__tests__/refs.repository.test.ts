import { CE_ALASQL_TABLE_NAME } from '#/databases/const-enum/CE_ALASQL_TABLE_NAME';
import { makeSQLDatabase } from '#/databases/files/makeSQLDatabase';
import { makeRepository } from '#/databases/repository/makeRepository';
import type { RefsRepository } from '#/databases/repository/refs/RefsRepository';
import { container } from '#/modules/containers/container';
import { REPOSITORY_REFS_SYMBOL_KEY } from '#/modules/containers/keys';
import alasql from 'alasql';
import pathe from 'pathe';
import { beforeAll, describe, expect, it } from 'vitest';

beforeAll(async () => {
  await makeSQLDatabase(pathe.join(process.cwd(), 'examples', 'db-for-test.json'));
  makeRepository();
});

describe('RefsRepository', () => {
  it('select', async () => {
    const refsRepo = container.resolve<RefsRepository>(REPOSITORY_REFS_SYMBOL_KEY);
    const r01 = await refsRepo.select('a');
    expect(r01).toMatchObject({ id: 'a', refId: 'c' });
  });

  it('select refs, but cannot found record', async () => {
    const refsRepo = container.resolve<RefsRepository>(REPOSITORY_REFS_SYMBOL_KEY);
    const r01 = await refsRepo.select('z');
    expect(r01).toBeUndefined();
  });

  it('selects', async () => {
    const refsRepo = container.resolve<RefsRepository>(REPOSITORY_REFS_SYMBOL_KEY);
    const r01 = await refsRepo.selects(['a', 'b']);

    expect(r01).toMatchObject([
      { id: 'a', refId: 'c' },
      { id: 'b', refId: 'd' },
    ]);
  });

  it('deletes', async () => {
    const refsRepo = container.resolve<RefsRepository>(REPOSITORY_REFS_SYMBOL_KEY);
    await refsRepo.deletes(['a', 'b']);
    expect(alasql.tables[CE_ALASQL_TABLE_NAME.REF]?.data.length).toEqual(2);
  });

  it('update', async () => {
    const refsRepo = container.resolve<RefsRepository>(REPOSITORY_REFS_SYMBOL_KEY);
    const updated = await refsRepo.update({ id: 'c', refId: 'd' });
    expect(updated).toMatchObject({ id: 'c', refId: 'd' });
  });

  it('insert', async () => {
    const refsRepo = container.resolve<RefsRepository>(REPOSITORY_REFS_SYMBOL_KEY);
    const inserted = await refsRepo.insert({
      id: 'x',
      refId: 'tXX',
    });

    expect(alasql.tables[CE_ALASQL_TABLE_NAME.REF]?.data.length).toEqual(3);
    expect(inserted).toMatchObject({
      id: 'x',
      refId: 'tXX',
    });
  });

  it('upsert, inserted', async () => {
    const refsRepo = container.resolve<RefsRepository>(REPOSITORY_REFS_SYMBOL_KEY);
    const inserted = await refsRepo.upsert({ id: 'y', refId: 'x' });
    expect(alasql.tables[CE_ALASQL_TABLE_NAME.REF]?.data.length).toEqual(4);
    expect(inserted).toMatchObject({ id: 'y', refId: 'x' });
  });

  it('upsert, updated', async () => {
    const refsRepo = container.resolve<RefsRepository>(REPOSITORY_REFS_SYMBOL_KEY);
    const inserted = await refsRepo.upsert({ id: 'd', refId: 'e' });
    expect(alasql.tables[CE_ALASQL_TABLE_NAME.REF]?.data.length).toEqual(4);
    expect(inserted).toMatchObject({ id: 'd', refId: 'e' });
  });
});
