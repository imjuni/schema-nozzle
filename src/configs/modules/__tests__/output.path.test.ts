import { getOutputPath } from '#/configs/modules/getOutputPath';
import pathe from 'pathe';
import { describe, expect, it } from 'vitest';

describe('getOutputPathHandler', () => {
  it('not set output directory', () => {
    const cwd = pathe.resolve(process.cwd());
    const project = pathe.join(cwd, 'examples', 'tsconfig.json');
    const output = getOutputPath(cwd, project);

    expect(output).toEqual(pathe.join(process.cwd(), 'examples'));
  });

  it('set output directory', () => {
    const cwd = pathe.resolve(process.cwd());
    const project = pathe.join(cwd, 'examples', 'tsconfig.json');
    const output = getOutputPath(cwd, project, 'examples');

    expect(output).toEqual(pathe.join(process.cwd(), 'examples'));
  });

  it('set absolute output directory', () => {
    const cwd = pathe.resolve(process.cwd());
    const project = pathe.join(cwd, 'examples', 'tsconfig.json');
    const output = getOutputPath(cwd, project, pathe.join(cwd, 'examples'));

    expect(output).toEqual(pathe.join(process.cwd(), 'examples'));
  });
});
