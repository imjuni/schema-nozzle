import { getGenericType } from '#/modules/generators/getGenericType';
import { describe, expect, it } from 'vitest';

describe('getGenericType', () => {
  it('not generic type', () => {
    const r01 = getGenericType('IamNotGeneric');
    expect(r01).toMatchObject({ name: 'IamNotGeneric', generic: false });
  });

  it('generic type', () => {
    const r01 = getGenericType('IamNotGeneric<THero>');
    expect(r01).toMatchObject({ name: 'IamNotGeneric', genericName: 'THero', generic: true });
  });
});
