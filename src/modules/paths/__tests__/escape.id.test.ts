import { escapeId } from '#/modules/paths/escapeId';
import { describe, expect, it } from 'vitest';

describe('escapeId', () => {
  it('escaped generic name', () => {
    const r01 = escapeId('TSimpleSetOptional<ICategoryDto, "id">');
    const r02 = escapeId('T.-_SimpleSetOptional<ICategoryDto, "id">');

    expect(r01).toEqual('TSimpleSetOptional_ICategoryDto___id__');
    expect(r02).toEqual('T.-_SimpleSetOptional_ICategoryDto___id__');
  });

  it('not escaped name', () => {
    const r01 = escapeId('TSimpleSetOptional');
    expect(r01).toEqual('TSimpleSetOptional');
  });
});
