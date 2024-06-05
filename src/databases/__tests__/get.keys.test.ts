import { getKeys } from '#/databases/getKeys';
import { describe, expect, it } from 'vitest';

describe('getKeys', () => {
  it('every case, 1-8', () => {
    const r01 = getKeys(1);
    const r02 = getKeys(2);
    const r03 = getKeys(3);
    const r04 = getKeys(4);
    const r05 = getKeys(5);
    const r06 = getKeys(6);
    const r07 = getKeys(7);
    const r08 = getKeys(8);

    expect(r01).toEqual({ id: 'id', def: 'definitions' });
    expect(r02).toEqual({ id: 'id', def: 'definitions' });
    expect(r03).toEqual({ id: 'id', def: 'definitions' });
    expect(r04).toEqual({ id: '$id', def: 'definitions' });
    expect(r05).toEqual({ id: '$id', def: 'definitions' });
    expect(r06).toEqual({ id: '$id', def: 'definitions' });
    expect(r07).toEqual({ id: '$id', def: 'definitions' });
    expect(r08).toEqual({ id: '$id', def: '$defs' });
  });
});
