import getExportedName from '#/compilers/getExportedName';
import getJsDocTags from '#/compilers/getJsDocTags';
import getTsProject from '#/compilers/getTsProject';
import getResolvedPaths from '#/configs/getResolvedPaths';
import 'jest';
import * as mnf from 'my-node-fp';
import path from 'path';
import * as tsm from 'ts-morph';

const originPath = process.env.INIT_CWD!;
const data: {
  resolvedPaths: ReturnType<typeof getResolvedPaths>;
  project: tsm.Project;
} = {} as any;

beforeAll(() => {
  data.project = new tsm.Project({
    tsConfigFilePath: path.join(originPath, 'examples', 'tsconfig.json'),
  });
});

beforeEach(() => {
  process.env.INIT_CWD = path.join(originPath, 'examples');
  data.resolvedPaths = getResolvedPaths({
    project: path.join(originPath, 'examples', 'tsconfig.json'),
    output: path.join(originPath, 'examples'),
  });
});

describe('getTsProject', () => {
  test('pass', async () => {
    const project = await getTsProject({ tsConfigFilePath: data.resolvedPaths.project });
    expect(project).toBeTruthy();
  });

  test('fail', async () => {
    try {
      await getTsProject({
        tsConfigFilePath: path.join(originPath, 'examples', '2'),
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test('fail - exception', async () => {
    const spy = jest.spyOn(mnf, 'exists').mockImplementationOnce(() => {
      throw new Error('raise error');
    });
    try {
      await getTsProject({
        tsConfigFilePath: path.join(originPath, 'examples', '2'),
      });
    } catch (err) {
      spy.mockRestore();
      expect(err).toBeTruthy();
    }
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

  test('normal', () => {
    const d1 = data.project.getSourceFile('c1.ts')!.getExportedDeclarations();

    const r = Array.from(d1.values())
      .flat()
      .map((node) => getExportedName(node));
    expect(r).toMatchObject(['ff', 'a', 'A', 'ar', 'IA', 'TA', 'EA']);
  });

  test('array literal', () => {
    try {
      const d1 = data.project.getSourceFile('c2.ts')!.getExportedDeclarations();
      Array.from(d1.values())
        .flat()
        .map((node) => getExportedName(node));
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });

  test('object literal', () => {
    try {
      const d1 = data.project.getSourceFile('c3.ts')!.getExportedDeclarations();
      Array.from(d1.values())
        .flat()
        .map((node) => getExportedName(node));
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });

  test('exception', () => {
    try {
      const d1 = data.project.getSourceFile('c5.ts')!.getExportedDeclarations();

      Array.from(d1.values())
        .flat()
        .map((node) => getExportedName(node));
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });

  test('binding element', () => {
    try {
      const d1 = data.project.getSourceFile('c6.ts')!.getExportedDeclarations();
      Array.from(d1.values())
        .flat()
        .map((node) => getExportedName(node));
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });

  test('object literal expression', () => {
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

  test('all', () => {
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
