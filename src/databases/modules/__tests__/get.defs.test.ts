import { getDefs } from '#/databases/modules/getDefs';
import { describe, expect, it } from 'vitest';

describe('getDefs', () => {
  it('from definitions', () => {
    const r01 = getDefs({ definitions: { test: { $id: 'test' } } });
    const r02 = getDefs({ definitions: {} });

    expect(r01?.at(0)?.key).toEqual('test');
    expect(r02).toBeUndefined();
  });

  it('from $defs', () => {
    const r01 = getDefs({ $defs: { test: { $id: 'test' } } });
    const r02 = getDefs({ $defs: {} });

    expect(r01?.at(0)?.key).toEqual('test');
    expect(r02).toBeUndefined();
  });

  it('not founds', () => {
    const defs = getDefs({ other: { $id: 'test' } });
    expect(defs).toBeUndefined();
  });
});
