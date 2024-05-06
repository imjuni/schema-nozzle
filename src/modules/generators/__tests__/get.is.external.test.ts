import { getIsExternal } from '#/modules/generators/getIsExternal';
import { describe, expect, it } from 'vitest';

describe('getIsExternal', () => {
  it('undefined importInfo', () => {
    const r01 = getIsExternal();
    expect(r01).toEqual(true);
  });

  it('external module', () => {
    const r01 = getIsExternal({ isExternal: true, moduleFilePath: undefined });
    expect(r01).toEqual(true);
  });

  it('cannot found moduleFilePath', () => {
    const r01 = getIsExternal({ isExternal: false, moduleFilePath: undefined });
    expect(r01).toEqual(true);
  });

  it('internal moulde', () => {
    const r01 = getIsExternal({ isExternal: false, moduleFilePath: 'a' });
    expect(r01).toEqual(false);
  });
});
