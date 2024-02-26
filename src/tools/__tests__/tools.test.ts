import getCwd from '#/tools/getCwd';
import getRatioNumber from '#/tools/getRatioNumber';
import getRelativeCwd from '#/tools/getRelativeCwd';
import posixJoin from '#/tools/posixJoin';
import safeParse from '#/tools/safeParse';
import * as jscp from 'jsonc-parser';
import path from 'node:path';
import { describe, expect, it, vitest } from 'vitest';

describe('getRativeCwd', () => {
  it('default', () => {
    expect(getRelativeCwd('/a/b/c', '/a/b/c/d/test.ts')).toEqual('d/test.ts');
  });
});

describe('posixJoin', () => {
  it('join path', () => {
    const joined = posixJoin('hello', 'world');
    expect(joined).toEqual('hello/world');
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

describe('safeParse', () => {
  it('get object', () => {
    const r01 = safeParse('{ "hello": "world" }');

    if (r01.type === 'fail') {
      throw new Error('invalid result');
    }

    expect(r01.pass).toMatchObject({ hello: 'world' });
  });

  it('exception', () => {
    const r01 = safeParse('{ hel lo: "world" }');

    if (r01.type === 'pass') {
      throw new Error('invalid result');
    }

    expect(r01.fail).toMatchObject({});

    const r02 = safeParse(
      '{ hel lo: "world", "hello1": "world1", "hello2": "world2", "hello3": "world3" }',
    );

    if (r02.type === 'pass') {
      throw new Error('invalid result');
    }

    expect(r02.fail).toMatchObject({});
  });

  it('exception -2', () => {
    const spy = vitest.spyOn(jscp, 'parse').mockImplementationOnce(() => {
      throw new Error();
    });

    const r = safeParse('{}');

    spy.mockRestore();
    if (r.type === 'pass') throw new Error('invalid');
    expect(r.fail).toBeInstanceOf(Error);
  });
});

describe('getCwd', () => {
  it('cwd', () => {
    const r01 = getCwd({});
    const e = path.resolve('.');

    expect(r01).toEqual(e);

    const r02 = getCwd({ USE_INIT_CWD: 'true', INIT_CWD: '/examples' });
    expect(r02).toEqual('/examples');

    const r03 = getCwd({ USE_INIT_CWD: 'false', INIT_CWD: '/examples' });
    expect(r03).toEqual(process.cwd());

    const r04 = getCwd({ INIT_CWD: '/examples' });
    expect(r04).toEqual(process.cwd());

    const r05 = getCwd({ USE_INIT_CWD: 'true' });
    const e2 = path.resolve('.');

    expect(r05).toEqual(e2);
  });
});
