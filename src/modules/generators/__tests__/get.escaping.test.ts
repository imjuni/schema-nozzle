import { getEscaping } from '#/modules/generators/getEscaping';
import { describe, expect, it } from 'vitest';

describe('getEscaping', () => {
  it('url, js-var', () => {
    const escaping = getEscaping({ url: true, jsVar: true });
    const r01 = escaping(`Pick<Test, 'id'>`, '@');
    console.log(r01);
    expect(r01).toEqual('Pick%40Test%40%40id%40%40');
  });

  it('url', () => {
    const escaping = getEscaping({ url: true, jsVar: false });
    const r01 = escaping(`Pick<Test, 'id'>`, '-');
    expect(r01).toEqual(`Pick%3CTest%2C'id'%3E`);
  });

  it('jsVar', () => {
    const escaping = getEscaping({ url: false, jsVar: true });
    const r01 = escaping(`Pick<Test, 'id'>`, '-');
    expect(r01).toEqual('Pick-Test--id--');
  });

  it('none', () => {
    const escaping = getEscaping({ url: false, jsVar: false });
    const r01 = escaping(`Pick<Test, 'id'>`, '-');
    expect(r01).toEqual(`Pick<Test,'id'>`);
  });
});
