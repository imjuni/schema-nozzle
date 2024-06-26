import { makeDatabase } from '#/databases/files/makeDatabase';
import { makeRepository } from '#/databases/repository/makeRepository';
import type { RefsRepository } from '#/databases/repository/refs/RefsRepository';
import { container } from '#/modules/containers/container';
import { $YMBOL_KEY_REPOSITORY_REFS } from '#/modules/containers/keys';
import pathe from 'pathe';
import { beforeAll, describe, expect, it } from 'vitest';

beforeAll(async () => {
  await makeDatabase(pathe.join($context.tsconfigDirPath, 'db-for-test.json'));
  makeRepository();
});

describe('RefsRepository', () => {
  it('select', async () => {
    const refsRepo = container.resolve<RefsRepository>($YMBOL_KEY_REPOSITORY_REFS);
    const r01 = await refsRepo.select('a');
    expect(r01).toMatchObject({ id: 'a', refId: 'c' });
  });

  it('select refs, but cannot found record', async () => {
    const refsRepo = container.resolve<RefsRepository>($YMBOL_KEY_REPOSITORY_REFS);
    const r01 = await refsRepo.select('z');
    expect(r01).toBeUndefined();
  });

  it('selects', async () => {
    const refsRepo = container.resolve<RefsRepository>($YMBOL_KEY_REPOSITORY_REFS);
    const r01 = await refsRepo.selects(['a', 'b']);

    expect(r01).toMatchObject([
      { id: 'a', refId: 'c' },
      { id: 'b', refId: 'd' },
    ]);
  });

  it('deletes', async () => {
    const refsRepo = container.resolve<RefsRepository>($YMBOL_KEY_REPOSITORY_REFS);
    await refsRepo.deletes(['a', 'b']);
    const r01 = await refsRepo.selects(['a', 'b']);
    expect(r01.length).toEqual(0);
  });

  it('insert', async () => {
    const refsRepo = container.resolve<RefsRepository>($YMBOL_KEY_REPOSITORY_REFS);
    const inserted = await refsRepo.insert({ id: 'x', refId: 'tXX' });

    expect(inserted).toMatchObject({ id: 'x', refId: 'tXX' });
  });

  it('upsert, inserted', async () => {
    const refsRepo = container.resolve<RefsRepository>($YMBOL_KEY_REPOSITORY_REFS);
    const inserted = await refsRepo.upsert({ id: 'y', refId: 'x' });
    expect(inserted).toMatchObject({ id: 'y', refId: 'x' });
  });

  it('upsert, updated', async () => {
    const refsRepo = container.resolve<RefsRepository>($YMBOL_KEY_REPOSITORY_REFS);
    const inserted = await refsRepo.upsert({ id: 'd', refId: 'b' });

    expect(inserted).toMatchObject({ id: 'd', refId: 'b' });
  });

  it('upsert, twice updated', async () => {
    const refsRepo = container.resolve<RefsRepository>($YMBOL_KEY_REPOSITORY_REFS);
    await refsRepo.upsert({
      id: '#/$defs/organations/IHero',
      refId: '#/$defs/organations/ITeam',
    });
    await refsRepo.upsert({
      id: '#/$defs/organations/IHero',
      refId: '#/$defs/organations/ITeam',
    });
    const inserted = await refsRepo.upsert({
      id: '#/$defs/organations/IHero',
      refId: '#/$defs/organations/ITeam',
    });

    expect(inserted).toMatchObject({
      id: '#/$defs/organations/IHero',
      refId: '#/$defs/organations/ITeam',
    });
  });
});
