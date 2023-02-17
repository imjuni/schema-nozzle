import getExportedName from '#compilers/getExportedName';
import getTsProject from '#compilers/getTsProject';
import getResolvedPaths from '#configs/getResolvedPaths';
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
    expect(project.type).toEqual('pass');
  });

  test('fail', async () => {
    const project = await getTsProject({
      tsConfigFilePath: path.join(originPath, 'examples', '2'),
    });
    expect(project.type).toEqual('fail');
  });

  test('fail - exception', async () => {
    jest.spyOn(mnf, 'exists').mockImplementationOnce(() => {
      throw new Error('raise error');
    });
    const project = await getTsProject({
      tsConfigFilePath: path.join(originPath, 'examples', '2'),
    });
    expect(project.type).toEqual('fail');
  });
});

describe('getExportedName', () => {
  beforeAll(() => {
    const sourceText = `export const a = 'hello';
    export class A {}
    export const ar = () => {};
    export function ff() {}
    export interface IA {}
    export type TA = number;
    export enum EA {}`;

    data.project.createSourceFile('c1.ts', sourceText);
    data.project.createSourceFile('c2.ts', `export default [1, 2, 3]`);
    data.project.createSourceFile('c3.ts', `export default { a: '1' }`);
    data.project.createSourceFile('c4.ts', `declare module 'nozzle' {}`);
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
});
