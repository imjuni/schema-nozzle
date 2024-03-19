import { getFastifySwaggerId } from '#/databases/modules/getFastifySwaggerId';
import { describe, expect, it } from 'vitest';

describe('getFastifySwaggerId', () => {
  it('no rootDirs', () => {
    const r01 = getFastifySwaggerId('/a/b/c/d', {});
    expect(r01).toEqual('-a-b-c-d');
  });

  it('with rootDirs', () => {
    const r01 = getFastifySwaggerId('#/e/f/g/h', { rootDirs: ['a'] });
    expect(r01).toEqual('-e-f-g-h');
  });
});
