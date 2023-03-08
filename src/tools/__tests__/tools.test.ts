import getCwd from '#tools/getCwd';
import getRatioNumber from '#tools/getRatioNumber';
import getRelativeCwd from '#tools/getRelativeCwd';
import logger from '#tools/logger';
import posixJoin from '#tools/posixJoin';
import safeParse from '#tools/safeParse';
import 'jest';
import * as jscp from 'jsonc-parser';
import path from 'path';

describe('getRativeCwd', () => {
  test('default', () => {
    expect(getRelativeCwd('/a/b/c', '/a/b/c/d/test.ts')).toEqual('d/test.ts');
  });
});

describe('posixJoin', () => {
  test('join path', () => {
    const joined = posixJoin('hello', 'world');
    expect(joined).toEqual('hello/world');
  });
});

describe('getRatioNumber', () => {
  test('get percent', () => {
    const r01 = getRatioNumber(0.3);
    const r02 = getRatioNumber(0.3, 100);

    expect(r01).toEqual(0.7);
    expect(r02).toEqual(70);
  });
});

describe('safeParse', () => {
  test('get object', () => {
    const r01 = safeParse('{ "hello": "world" }');

    if (r01.type === 'fail') {
      throw new Error('invalid result');
    }

    expect(r01.pass).toMatchObject({ hello: 'world' });
  });

  test('exception', () => {
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

  test('exception -2', () => {
    const spy = jest.spyOn(jscp, 'parse').mockImplementationOnce(() => {
      throw new Error();
    });

    const r = safeParse('{}');

    spy.mockRestore();
    if (r.type === 'pass') throw new Error('invalid');
    expect(r.fail).toBeInstanceOf(Error);
  });
});

describe('logger', () => {
  test('level - process.env undefined', () => {
    process.env = {};
    process.env.LOG_LEVEL = undefined;

    const log = logger();
    expect(log.level).toEqual('info');
  });

  test('log', () => {
    const log = logger();

    log.level = 'debug';
    log.debug('debug');
    log.verbose('verbose');
    log.trace('trace');
    log.warn('warn');
    log.info('info');
    log.error('error');
    log.fatal('fatal');

    log.level = 'verbose';
    log.debug('debug');
    log.verbose('verbose');
    log.trace('trace');
    log.warn('warn');
    log.info('info');
    log.error('error');
    log.fatal('fatal');
  });

  test('level - process.env', () => {
    process.env.LOG_LEVEL = 'verbose';
    const log = logger();
    expect(log.level).toEqual('verbose');
  });
});

describe('getCwd', () => {
  test('cwd', () => {
    const r01 = getCwd({});
    const e = path.resolve('.');

    expect(r01).toEqual(e);

    const r02 = getCwd({ INIT_CWD: '/examples' });
    expect(r02).toEqual('/examples');
  });
});
