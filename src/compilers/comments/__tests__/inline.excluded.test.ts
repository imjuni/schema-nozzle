import { getInlineExcludedFiles } from '#/compilers/comments/getInlineExcludedFiles';
import { randomUUID } from 'node:crypto';
import pathe from 'pathe';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

const tsconfigDirPath = pathe.join(process.cwd(), 'examples');
const tsconfigFilePath = pathe.join(tsconfigDirPath, 'tsconfig.example.json');
const context = {
  index: 0,
  tsconfig: tsconfigFilePath,
};

describe('getInlineExcludedFiles', () => {
  it('comment top of file', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const source01 = `
/**
 * @schema-nozzle-exclude schema-nozzle
 */
import fs from 'node:fs';

/**
 * eslint-disable-next-line
 */
export default class Hero {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }
}
    `;

    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `
import fs from 'node:fs';

export class SuperHero {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }
}
    `;

    const project = new tsm.Project({ tsConfigFilePath: tsconfigFilePath });
    project.createSourceFile(pathe.join(tsconfigDirPath, filename01), source01.trim());
    project.createSourceFile(pathe.join(tsconfigDirPath, filename02), source02.trim());

    const excluded = getInlineExcludedFiles(project, tsconfigDirPath);

    expect(excluded).toMatchObject([
      {
        commentCode: '/**\n * @schema-nozzle-exclude schema-nozzle\n */',
        filePath: pathe.join(tsconfigDirPath, filename01),
        pos: {
          start: 48,
          line: 4,
          column: 1,
        },
        tag: 'schema-nozzle-exclude',
        workspaces: ['schema-nozzle'],
      },
    ]);
  });

  it('comment middle of file', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const source01 = `
import fs from 'node:fs';

/** I am plain comment */
export default class Hero {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }
}
    `;

    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `
import fs from 'node:fs';

export class MarvelHero {
  #name: string;
  
  constructor(name: string) {
    this.#name = name;
  }
}

// @schema-nozzle-exclude schema-nozzle
export class DCHero {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }
}
    `;

    const project = new tsm.Project({ tsConfigFilePath: tsconfigFilePath });
    project.createSourceFile(pathe.join(tsconfigDirPath, filename01), source01.trim());
    project.createSourceFile(pathe.join(tsconfigDirPath, filename02), source02.trim());

    const excluded = getInlineExcludedFiles(project, tsconfigDirPath);

    expect(excluded).toMatchObject([
      {
        commentCode: '// @schema-nozzle-exclude schema-nozzle',
        filePath: pathe.join(tsconfigDirPath, filename02),
        pos: {
          start: 177,
          line: 12,
          column: 1,
        },
        tag: 'schema-nozzle-exclude',
        workspaces: ['schema-nozzle'],
      },
    ]);
  });
});
