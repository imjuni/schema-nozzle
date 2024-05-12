import { getExportedName } from '#/compilers/getExportedName';
import { getJsDocTags } from '#/compilers/getJsDocTags';
import { getResolvedPaths } from '#/configs/getResolvedPaths';
import pathe from 'pathe';
import type * as tsm from 'ts-morph';
import { getTypeScriptProject } from 'ts-morph-short';
import { beforeAll, beforeEach, describe, expect, it, vitest } from 'vitest';

vitest.mock('my-node-fp', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const mod = await importOriginal<typeof import('my-node-fp')>();
  return {
    ...mod,
  };
});

const originPath = process.env.INIT_CWD!;
const data: {
  resolvedPaths: ReturnType<typeof getResolvedPaths>;
  project: tsm.Project;
} = {} as any;

beforeAll(() => {
  data.project = getTypeScriptProject($context.tsconfigFilePath);
});

beforeEach(() => {
  process.env.INIT_CWD = pathe.join(originPath, 'examples');
  data.resolvedPaths = getResolvedPaths({
    rootDirs: [pathe.join(originPath, 'examples')],
    project: pathe.join(originPath, 'examples', 'tsconfig.json'),
    output: pathe.join(originPath, 'examples'),
  });
});

describe('getExportedName', () => {
  beforeAll(() => {
    const sourceText = `export const a = 'hello';
    export class A {}
    export const ar () => {};
    export function ff() {}
    export interface IA {}
    export type TA = number;
    export enum EA { A, B, C }`;

    data.project.createSourceFile('c1.ts', sourceText);
    data.project.createSourceFile('c2.ts', `export default [1, 2, 3]`);
    data.project.createSourceFile('c3.ts', `export default { a: '1' }`);
    data.project.createSourceFile('c4.ts', `declare module 'nozzle' {}`);
    data.project.createSourceFile('c5.ts', `export default () => {}`);
    data.project.createSourceFile(
      'c6.ts',
      `const obj = { a: 1, b: 2 }; export const { a, b } = obj;`,
    );
    data.project.createSourceFile('c7.ts', `export const { a, b }`);
  });

  it('normal', () => {
    const d1 = data.project.getSourceFile('c1.ts')!.getExportedDeclarations();

    const r = Array.from(d1.values())
      .flat()
      .map((node) => getExportedName(node));
    expect(r).toMatchObject(['ff', 'a', 'A', 'ar', 'IA', 'TA', 'EA']);
  });

  it('array literal', () => {
    try {
      const d1 = data.project.getSourceFile('c2.ts')!.getExportedDeclarations();
      Array.from(d1.values())
        .flat()
        .map((node) => getExportedName(node));
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });

  it('object literal', () => {
    try {
      const d1 = data.project.getSourceFile('c3.ts')!.getExportedDeclarations();
      Array.from(d1.values())
        .flat()
        .map((node) => getExportedName(node));
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });

  it('exception', () => {
    try {
      const d1 = data.project.getSourceFile('c5.ts')!.getExportedDeclarations();

      Array.from(d1.values())
        .flat()
        .map((node) => getExportedName(node));
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });

  it('binding element', () => {
    try {
      const d1 = data.project.getSourceFile('c6.ts')!.getExportedDeclarations();
      Array.from(d1.values())
        .flat()
        .map((node) => getExportedName(node));
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });

  it('object literal expression', () => {
    try {
      const d1 = data.project.getSourceFile('c7.ts')!.getExportedDeclarations();
      Array.from(d1.values())
        .flat()
        .map((node) => getExportedName(node));
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });
});

describe('getJsDocTags', () => {
  beforeAll(() => {
    const sourceText = `;
    /** @jsdoc-1 */
    export class T1_Class { name: string }

    /** @jsdoc-2 */
    export interface T2_Interface { name: string }
    
    /** @jsdoc-3 */
    export type T3_TypeAlias = { name: string };

    /** @jsdoc-4 */
    export enum T4_Enum {
      FIRST,
      SECOND
    }`;

    data.project.createSourceFile('tt1.ts', sourceText);
  });

  it('all', () => {
    const d1 = data.project.getSourceFile('tt1.ts')!.getExportedDeclarations();
    const tags = Array.from(d1.values())
      .flat()
      .map((r) => getJsDocTags(r))
      .flat();

    expect(tags.map((tag) => tag.getTagName())).toEqual([
      'jsdoc-1',
      'jsdoc-2',
      'jsdoc-3',
      'jsdoc-4',
    ]);
  });
});
