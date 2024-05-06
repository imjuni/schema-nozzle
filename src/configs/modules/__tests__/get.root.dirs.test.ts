import { getRootDirs } from '#/configs/modules/getRootDirs';
import { getCwd } from '#/tools/getCwd';
import pathe from 'pathe';
import { describe, expect, it } from 'vitest';

describe('getRootDirs', () => {
  it('nullable root-dirs', () => {
    const cwd = getCwd(process.env);
    const r01 = getRootDirs(cwd);
    expect(r01).toEqual([cwd]);
  });

  it('relative root-dirs', () => {
    const cwd = getCwd(process.env);
    const r01 = getRootDirs(cwd, ['./examples', './src']);
    expect(r01).toEqual([
      pathe.resolve(pathe.join(cwd, 'examples')),
      pathe.resolve(pathe.join(cwd, 'src')),
    ]);
  });

  it('absolute root-dirs', () => {
    const cwd = getCwd(process.env);
    const rootDirs = [
      pathe.resolve(pathe.join(cwd, 'examples')),
      pathe.resolve(pathe.join(cwd, 'src')),
    ];
    const r01 = getRootDirs(cwd, rootDirs);
    expect(r01).toEqual(rootDirs);
  });
});
