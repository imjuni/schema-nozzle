import { getInlineExcludedFiles } from '#/compilers/comments/getInlineExcludedFiles';
import { CE_JSDOC_EXTENDS } from '#/modules/const-enum/CE_JSDOC_EXTENDS';
import { randomUUID } from 'node:crypto';
import pathe from 'pathe';
import { getTypeScriptProject } from 'ts-morph-short';
import { beforeAll, describe, expect, it } from 'vitest';

const data: {
  context: {
    index: number;
    tsconfig: string;
  };
} = {
  context: {
    index: 0,
    tsconfig: '',
  },
} as any;

describe('getInlineExcludedFiles', () => {
  beforeAll(() => {
    data.context.tsconfig = $context.tsconfigDirPath;
  });

  it('comment top of file', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(data.context.index += 1)}.ts`;
    const source01 = `
/**
 * ${CE_JSDOC_EXTENDS.IGNORE_FILE_TAG} schema-nozzle
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

    const filename02 = `${uuid}_0${(data.context.index += 1)}.ts`;
    const source02 = `
import fs from 'node:fs';

export class SuperHero {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }
}
    `;

    const project = getTypeScriptProject($context.tsconfigEmptyPath);
    project.createSourceFile(pathe.join($context.tsconfigDirPath, filename01), source01.trim());
    project.createSourceFile(pathe.join($context.tsconfigDirPath, filename02), source02.trim());

    const excluded = getInlineExcludedFiles(project, $context.tsconfigDirPath);

    expect(excluded).toMatchObject([
      {
        commentCode: `/**\n * ${CE_JSDOC_EXTENDS.IGNORE_FILE_TAG} schema-nozzle\n */`,
        filePath: pathe.join($context.tsconfigDirPath, filename01),
        pos: {
          start: 48,
          line: 4,
          column: 1,
        },
        tag: CE_JSDOC_EXTENDS.IGNORE_FILE_TAG.substring(1),
        workspaces: ['schema-nozzle'],
      },
    ]);
  });

  it('comment middle of file', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(data.context.index += 1)}.ts`;
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

    const filename02 = `${uuid}_0${(data.context.index += 1)}.ts`;
    const source02 = `
import fs from 'node:fs';

export class MarvelHero {
  #name: string;
  
  constructor(name: string) {
    this.#name = name;
  }
}
// ${CE_JSDOC_EXTENDS.IGNORE_FILE_TAG} schema-nozzle

export class DCHero {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }
}
    `;

    const project = getTypeScriptProject($context.tsconfigEmptyPath);
    project.createSourceFile(pathe.join($context.tsconfigDirPath, filename01), source01.trim());
    project.createSourceFile(pathe.join($context.tsconfigDirPath, filename02), source02.trim());

    const excluded = getInlineExcludedFiles(project, $context.tsconfigDirPath);

    expect(excluded).toMatchObject([
      {
        commentCode: `// ${CE_JSDOC_EXTENDS.IGNORE_FILE_TAG} schema-nozzle`,
        filePath: pathe.join($context.tsconfigDirPath, filename02),
        pos: {
          start: 173,
          line: 12,
          column: 1,
        },
        tag: CE_JSDOC_EXTENDS.IGNORE_FILE_TAG.substring(1),
        workspaces: ['schema-nozzle'],
      },
    ]);
  });
});
