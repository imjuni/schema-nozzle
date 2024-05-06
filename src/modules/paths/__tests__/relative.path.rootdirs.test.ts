import { getRelativePathByRootDirs } from '#/modules/paths/getRelativePathByRootDirs';
import pathe from 'pathe';
import { describe, expect, it } from 'vitest';

describe('getRelativePathByRootDirs', () => {
  it('second descendent', () => {
    const r01 = getRelativePathByRootDirs(
      ['src/cli', 'src/configs/interfaces'].map((originPath) => pathe.resolve(originPath)),
      'IBaseOption',
      pathe.join(process.cwd(), 'src/configs/interfaces'),
    );

    expect(r01).toEqual('IBaseOption');
  });

  it('same directory', () => {
    const r01 = getRelativePathByRootDirs(
      ['src/cli', 'src/configs/interfaces'],
      'A',
      pathe.join(process.cwd(), 'src/cli'),
    );

    expect(r01).toEqual('A');
  });

  it('not descendent', () => {
    const r01 = getRelativePathByRootDirs(
      ['src/cli', 'src/configs/interfaces'],
      'getCwd',
      pathe.join(process.cwd(), 'src/tools'),
    );

    expect(r01).toEqual('../tools/getCwd');
  });
});
