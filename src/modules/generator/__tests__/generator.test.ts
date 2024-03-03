import { NozzleGenerator } from '#/modules/generator/NozzleGenerator';
import { generatorBootstrap, getGenerator } from '#/modules/generator/NozzleGeneratorContainer';
import { posixJoin } from '#/modules/paths/modules/posixJoin';
import { describe, expect, it } from 'vitest';

describe('NozzleGenerator', () => {
  it('constructor and getter', () => {
    const tsconfig = posixJoin(process.cwd(), 'tsconfig.json');
    const container = new NozzleGenerator({
      tsconfig,
      path: posixJoin(process.cwd(), 'examples', 'IStudentDto.ts'),
    });
    expect(container.generator).toBeDefined();
  });
});

describe('singletone-container', () => {
  it('bootstrap', () => {
    const tsconfig = posixJoin(process.cwd(), 'examples', 'tsconfig.json');

    generatorBootstrap({
      project: tsconfig,
      generatorOptionObject: { minify: false },
    });

    generatorBootstrap({
      project: tsconfig,
      generatorOptionObject: {},
    });

    const container = getGenerator();

    expect(container.generator).toBeDefined();
  });
});
