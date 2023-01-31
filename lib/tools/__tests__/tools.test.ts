import getCwd from '#tools/getCwd';
import getRatioNumber from '#tools/getRatioNumber';
import logger from '#tools/logger';
import posixJoin from '#tools/posixJoin';
import safeParse from '#tools/safeParse';
import 'jest';
import path from 'path';

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
    // @ts-ignore
    const r03 = getRatioNumber(undefined, 100);

    expect(r01).toEqual(0.7);
    expect(r02).toEqual(70);
    expect(r03).toEqual(100);
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
});

describe('logger', () => {
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
