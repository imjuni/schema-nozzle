import { isRelativeDtoPath } from '#/databases/modules/isRelativeDtoPath';
import { describe, expect, it } from 'vitest';

describe('isRelativeDtoPath', () => {
  it('multiple-case', () => {
    const r01 = isRelativeDtoPath({});
    expect(r01).toBeFalsy();
    const r02 = isRelativeDtoPath({ rootDir: './examples' });
    expect(r02).toBeTruthy();
    const r03 = isRelativeDtoPath({ rootDir: undefined });
    expect(r03).toBeFalsy();
  });
});
