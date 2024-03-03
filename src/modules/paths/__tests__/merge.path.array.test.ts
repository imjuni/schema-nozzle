import { mergePathArray } from '#/modules/paths/mergePathArray';
import { describe, expect, it } from 'vitest';

describe('mergePathArray', () => {
  it('merge to next', () => {
    const r01 = mergePathArray({ prev: ['a', 'b', 'c'], next: ['b', 'c', 'e'], direction: 'next' });
    expect(r01).toEqual(['b', 'c', 'e']);
  });

  it('merge to next by default', () => {
    const r01 = mergePathArray({ prev: ['a', 'b', 'c'], next: ['b', 'c', 'e'] });
    expect(r01).toEqual(['b', 'c', 'e']);
  });

  it('merge to prev by default', () => {
    const r01 = mergePathArray({ prev: ['a', 'b', 'c'], next: ['b', 'c', 'e'], direction: 'prev' });
    expect(r01).toEqual(['a', 'b', 'c']);
  });

  it('merge to intersaction', () => {
    const r01 = mergePathArray({
      prev: ['a', 'b', 'c'],
      next: ['b', 'c', 'e'],
      direction: 'intersaction',
    });
    expect(r01).toEqual(['b', 'c']);
  });

  it('merge to union', () => {
    const r01 = mergePathArray({
      prev: ['a', 'b', 'c'],
      next: ['b', 'c', 'e'],
      direction: 'union',
    });
    expect(r01).toEqual(['a', 'b', 'c', 'e']);
  });
});
