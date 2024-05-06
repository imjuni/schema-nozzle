import { getCwd } from '#/tools/getCwd';
import { getRatioNumber } from '#/tools/getRatioNumber';
import { getRelativeCwd } from '#/tools/getRelativeCwd';
import pathe from 'pathe';
import { describe, expect, it } from 'vitest';

describe('getRativeCwd', () => {
  it('default', () => {
    expect(getRelativeCwd('/a/b/c', '/a/b/c/d/test.ts')).toEqual('d/test.ts');
  });
});

describe('getRatioNumber', () => {
  it('get percent', () => {
    const r01 = getRatioNumber(0.3);
    const r02 = getRatioNumber(0.3, 100);

    expect(r01).toEqual(0.7);
    expect(r02).toEqual(70);
  });
});

describe('getCwd', () => {
  it('cwd', () => {
    const r01 = getCwd({});
    const e = pathe.resolve('.');

    expect(r01).toEqual(e);

    const r02 = getCwd({ USE_INIT_CWD: 'true', INIT_CWD: '/examples' });
    expect(r02).toEqual('/examples');

    const r03 = getCwd({ USE_INIT_CWD: 'false', INIT_CWD: '/examples' });
    expect(r03).toEqual(process.cwd());

    const r04 = getCwd({ INIT_CWD: '/examples' });
    expect(r04).toEqual(process.cwd());

    const r05 = getCwd({ USE_INIT_CWD: 'true' });
    const e2 = pathe.resolve('.');

    expect(r05).toEqual(e2);
  });
});
