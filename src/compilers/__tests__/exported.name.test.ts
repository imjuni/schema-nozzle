import { getExportedName } from '#/compilers/getExportedName';
import pathe from 'pathe';
import { getTypeScriptProject } from 'ts-morph-short';
import { beforeAll, describe, expect, it } from 'vitest';

const tsconfigDirPath = pathe.join(process.cwd(), 'examples');
const tsconfigFilePath = pathe.join(tsconfigDirPath, 'tsconfig.json');
const project = getTypeScriptProject(tsconfigFilePath);

describe('getExportedName', () => {
  beforeAll(() => {
    const sourceText = `export const a = 'hello';
    export class A {}
    export const ar () => {};
    export function ff() {}
    export interface IA {}
    export type TA = number;
    export enum EA { A, B, C }`;

    project.createSourceFile('c1.ts', sourceText);
    project.createSourceFile('c2.ts', `export default [1, 2, 3]`);
    project.createSourceFile('c3.ts', `export default { a: '1' }`);
    project.createSourceFile('c4.ts', `declare module 'nozzle' {}`);
    project.createSourceFile('c5.ts', `export default () => {}`);
    project.createSourceFile('c6.ts', `const obj = { a: 1, b: 2 }; export const { a, b } = obj;`);
    project.createSourceFile('c7.ts', `export const { a, b }`);
    project.createSourceFile('c8.ts', `export function name() { return 'hello'; }`);
    project.createSourceFile('c9.ts', `export default function() { return 'hello'; }`);
    project.createSourceFile('c10.ts', `export const name = () => { return 'hello'; }`);
    project.createSourceFile(
      'c11.ts',
      `declare module '@fastify/request-context' { interface RequestContextData { tid: string; } }`,
    );
  });

  it('normal', () => {
    const d1 = project.getSourceFile('c1.ts')!.getExportedDeclarations();

    const r = Array.from(d1.values())
      .flat()
      .map((node) => getExportedName(node));
    expect(r).toMatchObject(['ff', 'a', 'A', 'ar', 'IA', 'TA', 'EA']);
  });

  it('array literal', () => {
    try {
      const d1 = project.getSourceFile('c2.ts')!.getExportedDeclarations();
      Array.from(d1.values())
        .flat()
        .map((node) => getExportedName(node));
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });

  it('object literal', () => {
    try {
      const d1 = project.getSourceFile('c3.ts')!.getExportedDeclarations();
      Array.from(d1.values())
        .flat()
        .map((node) => getExportedName(node));
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });

  it('exception', () => {
    expect(() => {
      const d1 = project.getSourceFile('c5.ts')!.getExportedDeclarations();
      Array.from(d1.values())
        .flat()
        .map((node) => getExportedName(node));
    }).toThrowError();
  });

  it('binding element', () => {
    const d1 = project.getSourceFile('c6.ts')!.getExportedDeclarations();
    const r01 = Array.from(d1.values())
      .flat()
      .map((node) => getExportedName(node));
    expect(r01).toMatchObject(['a', 'b']);
  });

  it('object literal expression', () => {
    const d1 = project.getSourceFile('c7.ts')!.getExportedDeclarations();
    const r01 = Array.from(d1.values())
      .flat()
      .map((node) => getExportedName(node));
    expect(r01).toMatchObject(['a', 'b']);
  });

  it('function expression', () => {
    const d1 = project.getSourceFile('c8.ts')!.getExportedDeclarations();
    const r01 = Array.from(d1.values())
      .flat()
      .map((node) => getExportedName(node));
    expect(r01).toMatchObject(['name']);
  });

  it('anonymous function expression', () => {
    const d1 = project.getSourceFile('c9.ts')!.getExportedDeclarations();
    expect(() => {
      Array.from(d1.values())
        .flat()
        .map((node) => getExportedName(node));
    }).toThrowError();
  });

  it('arrow function expression', () => {
    const d1 = project.getSourceFile('c8.ts')!.getExportedDeclarations();
    const r01 = Array.from(d1.values())
      .flat()
      .map((node) => getExportedName(node));
    expect(r01).toMatchObject(['name']);
  });
});
